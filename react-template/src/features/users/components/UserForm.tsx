import { useForm, Controller } from 'react-hook-form';
import { Input } from '../../../components/uielements/Input';
import { CustomButton } from '../../../components/uielements/CustomButton';
import { CustomPassword } from '../../../components/uielements/CustomPassword';
import { PasswordRequirements } from '../../../components/uielements/PasswordRequirements';
import type { IUser, IUserForm } from '../user.types';
import { USER_ROLES } from '../../../context/auth/permissions.constants';

export interface IUserFormProps {
  initialData?: IUser;
  onSubmit: (data: IUserForm) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const UserForm = ({ initialData, onSubmit, onCancel, loading = false }: IUserFormProps) => {
  const isEditMode = !!initialData;

  const { control, handleSubmit, formState: { errors }, watch } = useForm<IUserForm>({
    defaultValues: {
      name: initialData?.name ?? '',
      email: initialData?.email ?? '',
      username: '',
      role: USER_ROLES.SUPER_ADMIN,
      password: '',
      confirmPassword: ''
    }
  });



  const onFormSubmit = (data: IUserForm) => {
    const payload: IUserForm = { ...data, role: USER_ROLES.SUPER_ADMIN };
    if (isEditMode && !payload.password) {
      const { password, ...dataWithoutPassword } = payload;
      onSubmit(dataWithoutPassword);
    } else {
      onSubmit(payload);
    }
  };

  const userValidationRules = {
    name: {
      required: 'Name is required',
      minLength: {
        value: 2,
        message: 'Name must be at least 2 characters'
      },
      pattern: {
        value: /^[a-zA-Z\s]+$/,
        message: 'Name can only contain letters and spaces'
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
      ...(isEditMode ? {} : { required: 'Password is required' }),
      ...(isEditMode ? {} : {
        minLength: {
          value: 8,
          message: 'Password must be at least 8 characters'
        },
        validate: (value: string | undefined) => {
          if (!value) return true; // Allow empty for edit mode
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
      })
    },
    username: {
      ...(isEditMode ? {} : { required: 'Username is required' }),
      ...(isEditMode ? {} : {
        minLength: {
          value: 3,
          message: 'Username must be at least 3 characters'
        },
        pattern: {
          value: /^\w+$/,
          message: 'Username can only contain letters, numbers, and underscores'
        }
      })
    },
    confirmPassword: () => ({
      ...(isEditMode ? {} : { required: 'Please confirm your password' }),
      validate: (value: string | undefined) => {
        if (isEditMode) return true;
        const password = watch('password');
        if (!value) return 'Please confirm your password';
        if (value !== password) {
          return 'Passwords do not match';
        }
        return true;
      }
    })
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <Controller
            name="name"
            control={control}
            rules={userValidationRules.name}
            render={({ field }) => (
              <Input
                {...field}
                label="Full Name *"
                placeholder="Enter user's full name"
                error={errors.name?.message}
                disabled={loading}
              />
            )}
          />
        </div>

        {/* Email */}
        <div>
          <Controller
            name="email"
            control={control}
            rules={userValidationRules.email}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                label="Email Address *"
                placeholder="Enter email address"
                error={errors.email?.message}
                disabled={loading || isEditMode}
                helpText={isEditMode ? "Email cannot be changed after user creation" : undefined}
              />
            )}
          />
        </div>

        {/* Username - Only show for create mode */}
        {!isEditMode && (
          <div>
            <Controller
              name="username"
              control={control}
              rules={userValidationRules.username}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ''}
                  label="Username *"
                  placeholder="johndoe"
                  error={errors.username?.message}
                  disabled={loading}
                />
              )}
            />
          </div>
        )}


        {/* Password */}
        <div>
          <Controller
            name="password"
            control={control}
            rules={userValidationRules.password}
            render={({ field }) => (
              <div>
                <CustomPassword
                  id="password"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label={isEditMode ? "New Password" : "Password *"}
                  placeholder={isEditMode ? "Leave blank to keep current password" : "••••••••"}
                  error={errors.password?.message}
                  disabled={loading}
                  helpText={isEditMode ? "Leave blank to keep current password" : undefined}
                />
                {!isEditMode && <PasswordRequirements password={field.value || ''} />}
              </div>
            )}
          />
        </div>

        {/* Confirm Password - Only show for create mode */}
        {!isEditMode && (
          <div>
            <Controller
              name="confirmPassword"
              control={control}
              rules={userValidationRules.confirmPassword()}
              render={({ field }) => (
                <CustomPassword
                  id="confirmPassword"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Confirm Password *"
                  placeholder="••••••••"
                  error={(errors as any).confirmPassword?.message}
                  disabled={loading}
                />
              )}
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {isEditMode ? 'Update User' : 'Create User'}
          </CustomButton>
        </div>
      </form>
    </div>
  );
}; 