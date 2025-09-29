// Re-export login types from existing login feature
export type { ILoginForm, ILoginResponse, ILoginError } from '../../features/auth/login/login.types';

// Import permission types
import type { Resource, Action } from './permissions.types';


// User interface
export interface IUser {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
}

// Auth state interface
export interface AuthState {
    user: IUser | null;
    isAuthenticated: boolean;
    userRole: string | null;
    isLoading: boolean;
}

export interface AuthContextType extends AuthState {
    // Auth state management
    logout: () => void;
    refreshUser: () => Promise<IUser | null>;

    // Permission methods
    canAccessResource: (resource: Resource, action: Action) => boolean;
    canView: (resource: Resource) => boolean;
    canCreate: (resource: Resource) => boolean;
    canUpdate: (resource: Resource) => boolean;
    canDelete: (resource: Resource) => boolean;
    canExport: (resource: Resource) => boolean;
    hasAnyPermission: (permissions: Array<{ resource: Resource; action: Action }>) => boolean;
    hasAllPermissions: (permissions: Array<{ resource: Resource; action: Action }>) => boolean;
}

// Login credentials interface
export interface LoginCredentials {
    username: string;
    password: string;
} 