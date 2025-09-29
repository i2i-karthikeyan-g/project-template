import type { User } from '../../../types/user';

export interface SignupForm {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface SignupResponse {
    user: User;
    token: string;
}

export interface SignupError {
    message: string;
    field?: string;
}

export interface SignupState {
    loading: boolean;
    error: string | null;
    user: User | null;
} 