/**
 * Generic API Service - Main api() function with object parameters
 * Handles different content types and integrates with axios instance
 */
import axiosInstance from './axiosInstance';
import type { ApiRequest } from './apitypes';
import { AxiosError } from 'axios';
import { API_CONTENT_TYPES } from './apiConstants';



interface IError {
  error: string;
}

/**
 * A flexible and type-safe wrapper around axios for making HTTP requests.
 * This function handles different content types, including JSON and FormData,
 * and provides consistent error handling across all request types.
 * 
 * @param {Object} params - The request parameters
 * @param {('get'|'post'|'put'|'delete'|'patch')} params.method - HTTP method to use
 * @param {string} params.url - The endpoint URL to send the request to
 * @param {any} [params.data] - The data to send with the request (required for post/put/patch)
 * @param {Object} [params.options] - Additional request options
 * @param {string} [params.options.contentType] - Content type of the request (defaults to 'application/json')
 * @param {Object} [params.options.headers] - Additional headers to include in the request
 * 
 * @returns {Promise<any>} A promise that resolves with the response data
 * 
 * @throws {Object} Throws an error object containing the error response data from the server
 * 
 * @example
 * // Simple GET request
 * const data = await api({
 *   method: 'get',
 *   url: '/api/users'
 * });
 * 
 * @example
 * // POST request with JSON data
 * const response = await api({
 *   method: 'post',
 *   url: '/api/users',
 *   data: { name: 'John', email: 'john@example.com' }
 * });
 * 
 * @example
 * // POST request with FormData
 * const formData = new FormData();
 * formData.append('file', fileInput.files[0]);
 * const response = await api({
 *   method: 'post',
 *   url: '/api/upload',
 *   data: formData,
 *   options: { contentType: 'multipart/form-data' }
 * });
 * 
 * @example
 * // Request with custom headers
 * const response = await api({
 *   method: 'get',
 *   url: '/api/protected',
 *   options: {
 *     headers: {
 *       'Authorization': 'Bearer token123'
 *     }
 *   }
 * });
 * 
 * @performance
 * - Automatically handles FormData conversion when needed
 * - Removes Content-Type header for FormData requests to let browser set proper boundary
 * - Uses a single axios instance for all requests, improving connection reuse
 */
export const api = async ({
  method,
  url,
  data,
  options = {}
}: ApiRequest): Promise<any> => {
  try {
    const contentType = options?.contentType ?? API_CONTENT_TYPES.JSON;
    let response;

    const config: any = {
      headers: {
        "Content-Type": contentType,
        ...options.headers
      },
    };
    
    if (contentType === API_CONTENT_TYPES.FORM_DATA && data) {
      if (!(data instanceof FormData)) {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
          }
        });
        data = formData;
      }
      // Remove Content-Type header for FormData to let browser set it with boundary
      delete config.headers['Content-Type'];
    }

    switch (method) {
      case 'get':
        response = await axiosInstance.get(url, config);
        break;
      case 'post':
        response = await axiosInstance.post(url, data, config);
        break;
      case 'put':
        response = await axiosInstance.put(url, data, config);
        break;
      case 'delete':
        response = await axiosInstance.delete(url, config);
        break;
      case 'patch':
        response = await axiosInstance.patch(url, data, config);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    return response.data;
  } catch (error) {
    const typedError = error as AxiosError<IError>;
    throw typedError.response?.data;
  }
}; 