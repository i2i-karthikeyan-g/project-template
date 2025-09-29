import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { processLogout, validateAuthToken } from './auth.service';
import type { AuthState, AuthContextType, IUser } from './auth.types';
import type { Resource, Action } from './permissions.types';
import { PERMISSIONS, ACTIONS } from './permissions.constants';
import { LOCAL_STORAGE_KEYS, LocalStorages } from '../../storage/LocalStorages';

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        userRole: null,
        isLoading: true,
    });

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const user = await validateAuthToken();
                updateAuthState(user, false);
            } catch (error) {
                console.error('Auth initialization failed:', error);
                // Clear invalid token if validation fails
                LocalStorages.remove(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
                updateAuthState(null, false);
            }
        };

        initializeAuth();
    }, []);

    const updateAuthState = (user: IUser | null, isLoading: boolean = false) => {
        setAuthState({
            user,
            isAuthenticated: !!user,
            userRole: user?.role ?? null,
            isLoading,
        });
    };

    const logout = async () => {
        try {
            await processLogout();
        } catch (error) {
            console.warn('Logout service call failed:', error);
        } finally {
            LocalStorages.remove(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
            updateAuthState(null);
        }
    };

    const refreshUser = async () => {
        const user = await validateAuthToken();
        updateAuthState(user);
        return user;
    };

    // Permission checking methods
    const canAccessResource = useCallback((resource: Resource, action: Action): boolean => {
        if (!authState.userRole) return false;

        const rolePermissions = (PERMISSIONS as any)[authState.userRole];
        if (!rolePermissions) return false;

        const resourcePermissions = rolePermissions[resource];
        if (!resourcePermissions) return false;

        return resourcePermissions.includes(action);
    }, [authState.userRole]);

    const canView = useCallback((resource: Resource): boolean => {
        return canAccessResource(resource, ACTIONS.VIEW);
    }, [canAccessResource]);

    const canCreate = useCallback((resource: Resource): boolean => {
        return canAccessResource(resource, ACTIONS.CREATE);
    }, [canAccessResource]);

    const canUpdate = useCallback((resource: Resource): boolean => {
        return canAccessResource(resource, ACTIONS.UPDATE);
    }, [canAccessResource]);

    const canDelete = useCallback((resource: Resource): boolean => {
        return canAccessResource(resource, ACTIONS.DELETE);
    }, [canAccessResource]);

    const canExport = useCallback((resource: Resource): boolean => {
        return canAccessResource(resource, ACTIONS.EXPORT);
    }, [canAccessResource]);

    const hasAnyPermission = useCallback((permissions: Array<{ resource: Resource; action: Action }>): boolean => {
        return permissions.some(({ resource, action }) => canAccessResource(resource, action));
    }, [canAccessResource]);

    const hasAllPermissions = useCallback((permissions: Array<{ resource: Resource; action: Action }>): boolean => {
        return permissions.every(({ resource, action }) => canAccessResource(resource, action));
    }, [canAccessResource]);

    const contextValue: AuthContextType = useMemo(() => ({
        ...authState,
        logout,
        refreshUser,
        canAccessResource,
        canView,
        canCreate,
        canUpdate,
        canDelete,
        canExport,
        hasAnyPermission,
        hasAllPermissions,
    }), [
        authState,
        logout,
        refreshUser,
        canAccessResource,
        canView,
        canCreate,
        canUpdate,
        canDelete,
        canExport,
        hasAnyPermission,
        hasAllPermissions,
    ]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}; 