/**
 * Auth Service - Centralized authentication API functions
 */
import { api, resources } from '../../services/api';
import type { ApiResponse } from '../../services/api';
import { LocalStorages, LOCAL_STORAGE_KEYS } from '../../storage/LocalStorages';
import type { IUser } from './auth.types';


/**
 * Get current user data from auth/me endpoint
 * @returns Promise with user data
 */
export const processGetCurrentUser = async (): Promise<IUser> => {
    const { method, url } = resources.auth.me;
    const response: ApiResponse<{ user: IUser }> = await api({
        method,
        url,
    });
    const rawUser = response.data.user;

    // Normalize nested organization fields to camelCase used in FE
    const normalizedUser: IUser = {
        id: String(rawUser.id),
        name: rawUser.name,
        username: rawUser.username,
        email: rawUser.email,
        role: rawUser.role,
        isActive: Boolean(rawUser.isActive),
    };

    return normalizedUser;
};

/**
 * Logout user
 * @returns Promise<void>
 */
export const processLogout = async (): Promise<ApiResponse<null>> => {
    const { method, url } = resources.auth.logout;
    const response = await api({
        method,
        url,
    });

    return response;
};



/**
 * Check if user is authenticated by validating stored token
 * @returns Promise with user data if authenticated, null otherwise
 */
export const validateAuthToken = async (): Promise<IUser | null> => {
    // Mocking user for local development and testing
    return new Promise((resolve) => {
        setTimeout(async () => {
            const user = { id: '1', name: 'Test User', username: 'testuser', email: 'admin@gmail.com', role: 'admin', isActive: true };
            resolve(user);
        }, 500);
    });
    
    // Real implementation
    const token = LocalStorages.get(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
        return null;
    }

    try {
        const user = await processGetCurrentUser();
        return user;
    } catch (error: any) {
        // Clear invalid tokens on any error
        LocalStorages.remove(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

        console.warn('Token validation failed:', error?.message || error);
        return null;
    }
};




