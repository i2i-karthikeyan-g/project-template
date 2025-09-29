import React from 'react';
import { InputText } from 'primereact/inputtext';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  id?: string;
  type?: string;
  leftIcon?: string;
  rightIcon?: string;
  onIconClick?: () => void;
  showClearButton?: boolean;
  onClear?: () => void;
}

/**
 * Pure controlled Input component with Tailwind styling and PrimeReact functionality
 */
export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  onBlur,
  label,
  error,
  helpText,
  placeholder,
  disabled = false,
  size = 'md',
  fullWidth = true,
  className = '',
  id,
  type = 'text',
  leftIcon,
  rightIcon,
  onIconClick,
  showClearButton = false,
  onClear,
}) => {
  const getInputClasses = (): string => {
    const baseClasses = 'transition-colors duration-200 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-20';

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'bg-transparent border-gray-400 focus:border-primary-500 focus:ring-primary-500';

    const disabledClasses = disabled
      ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200'
      : '';

    const widthClasses = fullWidth ? 'w-full' : '';

    // Adjust padding for icons - account for clear button and right icon
    let iconPaddingClasses = '';
    if (leftIcon) {
      iconPaddingClasses += 'pl-10 ';
    }
    if (rightIcon) {
      // If we have both right icon and clear button with value, need extra padding
      if (showClearButton && value.length > 0) {
        iconPaddingClasses += 'pr-16 '; // Space for both clear button and right icon
      } else {
        iconPaddingClasses += 'pr-10 '; // Space for just right icon
      }
    } else if (showClearButton && value.length > 0) {
      iconPaddingClasses += 'pr-10 '; // Space for just clear button
    }

    return [
      baseClasses,
      sizeClasses[size],
      errorClasses,
      disabledClasses,
      widthClasses,
      iconPaddingClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');
  };

  const getIconClasses = (position: 'left' | 'right'): string => {
    const baseClasses = 'absolute top-1/2 transform -translate-y-1/2 text-gray-400';
    const positionClasses = position === 'left' ? 'left-3' : 'right-3';
    const clickableClasses = onIconClick ? 'cursor-pointer hover:text-gray-600' : '';

    return [baseClasses, positionClasses, clickableClasses].filter(Boolean).join(' ');
  };

  const getClearButtonClasses = (): string => {
    const baseClasses = 'absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200';
    const positionClasses = rightIcon ? 'right-10' : 'right-3';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return [baseClasses, positionClasses, disabledClasses].filter(Boolean).join(' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleIconClick = () => {
    if (onIconClick && !disabled) {
      onIconClick();
    }
  };

  const handleClearClick = () => {
    if (onClear && !disabled && value.length > 0) {
      onClear();
    }
  };

  const handleClearKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClearClick();
    }
  };

  return (
    <div className={`inline-block ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative w-full">
        {leftIcon ? (
          <i
            className={`${leftIcon} ${getIconClasses('left')}`}
            onClick={handleIconClick}
          />
        ) : null}

        <InputText
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputClasses()}
        />

        {/* Clear Button */}
        {showClearButton && value.length > 0 && (
          <button
            type="button"
            className={getClearButtonClasses()}
            onClick={handleClearClick}
            onKeyDown={handleClearKeyDown}
            disabled={disabled}
            aria-label="Clear input"
            title="Clear input"
          >
            <i className="pi pi-times text-sm" />
          </button>
        )}

        {/* Right Icon - always show if provided */}
        {rightIcon && (
          <i
            className={`${rightIcon} ${getIconClasses('right')}`}
            onClick={handleIconClick}
          />
        )}
      </div>

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

export default Input; 