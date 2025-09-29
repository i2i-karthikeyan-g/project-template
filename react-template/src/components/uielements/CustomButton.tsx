import React from 'react';
import { Button } from 'primereact/button';
import type { ButtonProps } from 'primereact/button';

interface CustomButtonProps extends Omit<ButtonProps, 'className' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  icon?: string;
  id?: string;
  tooltip?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  icon,
  id,
  tooltip,
  ...props
}) => {
  const getVariantClasses = (): string => {
    const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border flex items-center justify-center gap-2';

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-primary-600 hover:bg-primary-700 text-white border-primary-600 hover:border-primary-700 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 hover:bg-gray-200 text-dark border-gray-300 hover:border-gray-400 focus:ring-gray-500 disabled:bg-gray-50`;
      case 'outline':
        return `${baseClasses} bg-transparent hover:bg-primary-50 text-primary-600 border-2 border-primary-500 hover:border-primary-600 focus:ring-primary-500 disabled:text-primary-300 disabled:border-primary-200`;
      case 'ghost':
        return `${baseClasses} bg-transparent hover:bg-gray-100 text-gray-700 border-transparent hover:border-gray-300 focus:ring-gray-500 disabled:text-gray-400`;
      case 'danger':
        return `${baseClasses} bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 focus:ring-red-500 disabled:bg-red-300`;
      default:
        return baseClasses;
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm rounded-md';
      case 'md':
        return 'px-4 py-2 text-base rounded-lg';
      case 'lg':
        return 'px-6 py-3 text-lg rounded-lg';
      default:
        return 'px-4 py-2 text-base rounded-lg';
    }
  };

  const getWidthClasses = (): string => {
    return fullWidth ? 'w-full' : '';
  };

  const getDisabledClasses = (): string => {
    return disabled ? 'cursor-not-allowed' : 'cursor-pointer';
  };

  const combinedClassName = [
    getVariantClasses(),
    getSizeClasses(),
    getWidthClasses(),
    getDisabledClasses(),
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Button
      {...props}
      className={combinedClassName}
      disabled={disabled}
      id={id}
      tooltip={tooltip}
    >
      {icon && <i className={icon} />}
      {children && <span className="flex justify-center items-center">{children}</span>}
    </Button>
  );
};

export default CustomButton; 