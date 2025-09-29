import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/uielements/Input';
import { CustomPassword } from '../../../components/uielements/CustomPassword';
import { CustomButton } from '../../../components/uielements/CustomButton';
import { useAuthContext } from '../../../context/auth/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { loginUser } from './login.service';
import type { ILoginForm } from './login.types';
import { ROUTES } from '../../../constants/routePaths.constants';
import { USER_ROLES } from '../../../context/auth/permissions.constants';

export const Login = () => {
    const navigate = useNavigate();
    const { showSuccessToast, showErrorToast } = useToast();
    const { refreshUser } = useAuthContext();
    const [loading, setLoading] = useState(false);

    const loginValidationRules = {
        username: {
            required: 'Username is required',
            minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
            }
        },
        password: {
            required: 'Password is required',
            minLength: {
                value: 3,
                message: 'Password must be at least 3 characters'
            }
        }
    };

    const { control, handleSubmit } = useForm<ILoginForm>({
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const handleLogin = async (data: ILoginForm) => {
        setLoading(true);
        try {

            await loginUser(data);
            const user = await refreshUser();
            showSuccessToast('Login successful');
            const role = user?.role;
            const target = role === USER_ROLES.SUPER_ADMIN ? ROUTES.CLIENTS : ROUTES.PROFILE;
            setTimeout(() => {
                navigate(target);
            }, 1000);
        } catch (error: any) {
            showErrorToast(error?.message);
        } finally {
            setLoading(false);
        }
    };

    // const handleSignUpRedirect = () => {
    //     navigate(ROUTES.SIGNUP);
    // };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Main Login Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 my-4">
                {/* Title Section */}
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
                    <p className="text-gray-600 text-sm sm:text-base">Welcome back! Please enter your details.</p>
                </div>

                <form onSubmit={handleSubmit(handleLogin)} className="space-y-5 sm:space-y-6">
                    {/* Username Field */}
                    <Controller
                        name="username"
                        control={control}
                        rules={loginValidationRules.username}
                        render={({ field, fieldState }) => (
                            <Input
                                id="username"
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                label="Username"
                                placeholder="Enter your username"
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    {/* Password Field */}
                    <Controller
                        name="password"
                        control={control}
                        rules={loginValidationRules.password}
                        render={({ field, fieldState }) => (
                            <CustomPassword
                                id="password"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                label="Password"
                                placeholder="••••••••"
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    {/* Sign In Button */}
                    <CustomButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        disabled={loading}
                        loading={loading}
                    >
                        Sign in
                    </CustomButton>
                </form>

                {/* Sign Up Link
                <div className="mt-5 sm:mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={handleSignUpRedirect}
                            className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                        >
                            Create your account
                        </button>
                    </p>
                </div> */}
            </div>
        </div>
    );
};

export default Login; 