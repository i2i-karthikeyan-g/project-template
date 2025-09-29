
import { AuthLayout } from '../layouts/AuthLayout';
import { Login } from '../features/auth/login/Login';

export const LoginPage = () => {
    return (
        <AuthLayout>
            <Login />
        </AuthLayout>
    );
};

export default LoginPage; 