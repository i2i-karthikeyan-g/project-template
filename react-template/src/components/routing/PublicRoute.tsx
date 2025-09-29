import { Navigate } from "react-router-dom";
import { ROUTES } from "../../constants/routePaths.constants";
import { useAuthContext } from "../../context/auth/AuthContext";
import Loading from "../uielements/Loading";

/**
 * Public Route component (redirects to accounts if authenticated)
 */
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuthContext();

    // Show loading while checking authentication
    if (isLoading) {
        return <Loading loading={isLoading} fullPage />;
    }

    if (isAuthenticated) {
        return <Navigate to={ROUTES.PROFILE} replace />;
    }

    return <>{children}</>;
};