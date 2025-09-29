import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/auth/AuthContext';
import { ACTIONS, USER_ROLES } from '../../context/auth/permissions.constants';
import type { Resource, Action } from '../../context/auth/permissions.types';
import { ROUTES } from '../../constants/routePaths.constants';
import Loading from '../uielements/Loading';

interface ResourceProtectedRouteProps {
  children: React.ReactNode;
  resource: Resource;
  action?: Action;
  fallbackPath?: string;
}

export const ResourceProtectedRoute = ({
  children,
  resource,
  action = ACTIONS.VIEW,
  fallbackPath
}: ResourceProtectedRouteProps) => {
  const { canAccessResource, isAuthenticated, isLoading, userRole } = useAuthContext();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Loading loading={isLoading} fullPage />
    );
  }

  // Safety check
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check resource permission
  if (!canAccessResource(resource, action)) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
    if (userRole === USER_ROLES.SUPER_ADMIN) {
      return <Navigate to={ROUTES.CLIENTS} replace />;
    } else if (userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.USER) {
      return <Navigate to={ROUTES.CLIENT_USERS} replace />;
    }
    return <Navigate to={ROUTES.PROFILE} replace />;
  }

  return <>{children}</>;
}; 