import axios from 'axios';
import { LocalStorages, LOCAL_STORAGE_KEYS } from '../../storage/LocalStorages';
import { ENVIRONMENT } from '../../constants/env.constants';

const axiosInstance = axios.create({
  baseURL: ENVIRONMENT.VITE_API_BASE_URL,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: unknown, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = LocalStorages.get(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers["Authorization"] = "Bearer " + token;
      }
      return config;
    } catch (error) {
      return Promise.reject(error as Error);
    }
  },
  (error) => {
    return Promise.reject(error as Error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      if (error.response.status === 401 && !originalRequest._retry) {
        if (originalRequest.url === `${ENVIRONMENT.VITE_API_BASE_URL}/login`) {
          return Promise.reject(error as Error);
        }

        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err as Error);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // const refreshToken = LocalStorages.get(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
        // if (!refreshToken) {
        //   return Promise.reject(error as Error);
        // }

        try {
          // const response = await axiosInstance.post("/rotate_token", {
          //   grant_type: "refresh_token",
          //   refresh_token: refreshToken,
          // });

          // const newAccessToken = response.data.access_token;

          // LocalStorages.set(LOCAL_STORAGE_KEYS.AUTH_TOKEN, newAccessToken);

          // axiosInstance.defaults.headers["Authorization"] =
            // "Bearer " + newAccessToken;
          // originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;

          // processQueue(null, newAccessToken);

          return axiosInstance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          LocalStorages.remove(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

          window.location.href = '/login';
          return Promise.reject(err as Error);
        } finally {
          isRefreshing = false;
        }
      }
    } else {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error as Error);
  }
);

export default axiosInstance; 