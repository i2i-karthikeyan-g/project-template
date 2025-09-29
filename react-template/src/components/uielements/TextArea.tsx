import React from 'react';
import { InputTextarea } from 'primereact/inputtextarea';

interface TextAreaProps {
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
  rows?: number;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  showCharCount?: boolean;
}

/**
 * Pure controlled TextArea component with Tailwind styling and PrimeReact functionality
 */
export const TextArea: React.FC<TextAreaProps> = ({
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
  rows = 4,
  maxLength,
  resize = 'vertical',
  showCharCount = false,
}) => {
  const getTextAreaClasses = (): string => {
    const baseClasses = 'transition-colors duration-200 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-20 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-gray-500';

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

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return [
      baseClasses,
      sizeClasses[size],
      errorClasses,
      disabledClasses,
      widthClasses,
      resizeClasses[resize],
      className,
    ]
      .filter(Boolean)
      .join(' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    onChange(newValue);
  };

  const characterCount = value.length;
  const isNearLimit = maxLength && characterCount > maxLength * 0.8;
  const isAtLimit = maxLength && characterCount >= maxLength;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="overflow-hidden rounded-md">
        <InputTextarea
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={getTextAreaClasses()}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #F3F4F6'
          }}
        />
      </div>

      <div className="flex justify-between items-center mt-1">
        <div>
          {error && (
            <span className="block text-red-500 text-sm">
              {error}
            </span>
          )}

          {helpText && !error && (
            <span className="block text-gray-600 text-sm">
              {helpText}
            </span>
          )}
        </div>

        {(showCharCount || maxLength) && (
          <span
            className={`text-xs ${isAtLimit
              ? 'text-red-500'
              : isNearLimit
                ? 'text-warning-600'
                : 'text-gray-500'
              }`}
          >
            {characterCount}{maxLength && `/${maxLength}`}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextArea; 