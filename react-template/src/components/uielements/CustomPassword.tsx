import React from 'react';
import { Password } from 'primereact/password';

interface CustomPasswordProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  inputVariant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
  className?: string;
  id?: string;
  header?: React.ReactNode;
  feedback?: boolean;
}


export const CustomPassword: React.FC<CustomPasswordProps> = ({
  value,
  onChange,
  onBlur,
  label,
  error,
  helpText,
  placeholder,
  disabled = false,
  size = 'md',
  inputVariant = 'default',
  fullWidth = true,
  className = '',
  id,
  feedback = false,
  header,
}) => {

  const getInputClasses = (): string => {
    const baseClasses = 'transition-colors duration-200 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-20';

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    const variantClasses = {
      default: 'bg-white border-gray-300 focus:border-primary-500 focus:ring-primary-500',
      filled: 'bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-primary-500',
      outlined: 'bg-transparent border-gray-400 focus:border-primary-500 focus:ring-primary-500',
    };

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : variantClasses[inputVariant];

    const disabledClasses = disabled
      ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200'
      : '';

    const widthClasses = fullWidth ? 'w-full' : '';

    return [
      baseClasses,
      sizeClasses[size],
      errorClasses,
      disabledClasses,
      widthClasses,
    ]
      .filter(Boolean)
      .join(' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={fullWidth ? 'w-full' : ''} style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <Password
        inputId={id}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full block ${className}`}
        inputClassName={getInputClasses()}
        style={{ width: '100%' }}
        feedback={feedback}
        toggleMask
        header={header}
      />

      {error && (
        <span className="block text-red-500 text-sm mt-1">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span className="block text-gray-600 text-sm mt-1">
          {helpText}
        </span>
      )}
    </div>
  );
};

export default CustomPassword; 