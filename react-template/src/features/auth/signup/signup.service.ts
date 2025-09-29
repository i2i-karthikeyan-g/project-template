
import { api, resources } from '../../../services/api';
import type { ApiResponse } from '../../../services/api';
import type { SignupForm } from './signup.types';

/**
 * Register new user
 * @param formData - Signup form data
 * @returns Promise with user data and token
 */
export const processSignup = async (formData: SignupForm): Promise<ApiResponse<{ user: any; token: string }>> => {
    const { method, url } = resources.auth.signup;

    const response = await api({
        method,
        url,
        data: {
            name: formData.name,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
        }
    });

    return response;
};

