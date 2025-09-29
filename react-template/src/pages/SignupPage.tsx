
import { AuthLayout } from '../layouts/AuthLayout';
import { Signup } from '../features/auth/signup/Signup';

export const SignupPage = () => {
    return (
        <AuthLayout>
            <Signup />
        </AuthLayout>
    );
};

export default SignupPage; 