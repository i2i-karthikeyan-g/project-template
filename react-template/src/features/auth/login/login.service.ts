/**
 * Login Service - Handle all login-related API operations
 */
import { api, resources, API_CONTENT_TYPES } from '../../../services/api';
import { LocalStorages, LOCAL_STORAGE_KEYS } from '../../../storage/LocalStorages';
import type { ILoginForm, ILoginResponse } from './login.types';

/**
 * Store auth token
 * @param token - Auth token to store
 */
const storeToken = async (token: string): Promise<void> => {
    return Promise.resolve(LocalStorages.set(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token));
};



/**
 * Authenticate user with login credentials
 * @param credentials - Login credentials
 * @returns Promise with OAuth2 token response
 */
export const processLogin = async (credentials: ILoginForm): Promise<ILoginResponse> => {
    try {
        const { method, url } = resources.auth.login;
        const response: ILoginResponse = await api({
            method,
            url,
            data: credentials,
            options: {
                contentType: API_CONTENT_TYPES.FORM_URL_ENCODED
            }
        });

        // Validate response structure
        if (!response?.access_token) {
            throw new Error('Invalid login response');
        }

        return response;
    } catch (error: any) {
        console.error('Login failed:', error);
        throw error;
    }
};

/**
 * Complete login flow - authenticate and store token
 * @param credentials - Login form credentials
 * @returns Promise with login response
 */
export const loginUser = async (credentials: ILoginForm): Promise<ILoginResponse> => {
    try {
        // Step 1: Authenticate and get token
        const tokenResponse = await processLogin(credentials);

        // Step 2: Store the token
        await storeToken(tokenResponse.access_token);

        return tokenResponse;
    } catch (error) {
        // Clean up any stored token on login failure
        LocalStorages.remove(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        throw error;
    }
};