import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/uielements/Input';
import { CustomPassword } from '../../../components/uielements/CustomPassword';
import { CustomButton } from '../../../components/uielements/CustomButton';
import { PasswordRequirements } from '../../../components/uielements/PasswordRequirements';
import { processSignup } from './signup.service';
import { useToast } from '../../../context/ToastContext';
import type { SignupForm } from './signup.types';
import { ROUTES } from '../../../constants/routePaths.constants';


export const Signup = () => {

    const navigate = useNavigate();

    const { showSuccessToast, showErrorToast } = useToast();

    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, watch } = useForm<SignupForm>({
        defaultValues: {
            name: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const password = watch('password');

    const signupValidationRules = {
        name: {
            required: 'Full name is required',
            minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
            },
            pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: 'Name can only contain letters and spaces'
            }
        },
        username: {
            required: 'Username is required',
            minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
            },
            pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores'
            }
        },
        email: {
            required: 'Email is required',
            pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
            }
        },
        password: {
            required: 'Password is required',
            minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
            },
            validate: (value: string) => {
                if (!/(?=.*[a-z])/.test(value)) {
                    return 'Password must contain at least one lowercase letter';
                }
                if (!/(?=.*[A-Z])/.test(value)) {
                    return 'Password must contain at least one uppercase letter';
                }
                if (!/(?=.*\d)/.test(value)) {
                    return 'Password must contain at least one number';
                }
                return true;
            }
        },
        confirmPassword: () => ({
            required: 'Please confirm your password',
            validate: (value: string) => {
                if (value !== password) {
                    return 'Passwords do not match';
                }
                return true;
            }
        })
    };

    const handleSignup = async (data: SignupForm) => {
        setLoading(true);
        try {
            const response = await processSignup(data);
            showSuccessToast(`Welcome, ${response.data.user.name}! Please sign in to continue.`);

            navigate(ROUTES.LOGIN);

        } catch (error: any) {
            showErrorToast(error?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        navigate(ROUTES.LOGIN);
    };



    return (
        <div className="w-full max-w-md mx-auto">
            {/* Main Signup Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 my-4">
                {/* Title Section */}
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
                </div>

                <form onSubmit={handleSubmit(handleSignup)} className="space-y-5 sm:space-y-6">
                    {/* Full Name Field */}
                    <Controller
                        name="name"
                        control={control}
                        rules={signupValidationRules.name}
                        render={({ field, fieldState }) => (
                            <Input
                                id="name"
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                label="Full Name"
                                placeholder="John Doe"
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    {/* Username Field */}
                    <Controller
                        name="username"
                        control={control}
                        rules={signupValidationRules.username}
                        render={({ field, fieldState }) => (
                            <Input
                                id="username"
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                label="Username"
                                placeholder="johndoe"
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    {/* Email Field */}
                    <Controller
                        name="email"
                        control={control}
                        rules={signupValidationRules.email}
                        render={({ field, fieldState }) => (
                            <Input
                                id="email"
                                type="email"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                label="Email"
                                placeholder="you@example.com"
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    {/* Password Field */}
                    <Controller
                        name="password"
                        control={control}
                        rules={signupValidationRules.password}
                        render={({ field, fieldState }) => (
                            <div>
                                <CustomPassword
                                    id="password"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    label="Password"
                                    placeholder="••••••••"
                                    error={fieldState.error?.message}
                                    feedback={true}
                                    header={<PasswordRequirements password={field.value} className='pb-4' />}
                                />
                                {/* <PasswordRequirements password={field.value} /> */}
                            </div>
                        )}
                    />

                    {/* Confirm Password Field */}
                    <Controller
                        name="confirmPassword"
                        control={control}
                        rules={signupValidationRules.confirmPassword()}
                        render={({ field, fieldState }) => (
                            <CustomPassword
                                id="confirmPassword"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                label="Confirm Password"
                                placeholder="••••••••"
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    {/* Create Account Button */}
                    <CustomButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        disabled={loading}
                        loading={loading}
                    >
                        Create Account
                    </CustomButton>
                </form>

                {/* Sign In Link */}
                <div className="mt-5 sm:mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={handleLoginRedirect}
                            className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup; 