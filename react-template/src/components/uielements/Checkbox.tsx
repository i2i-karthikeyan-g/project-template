import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  name?: string;
  value?: string;
  truncate?: boolean;
}

/**
 * Pure controlled Checkbox component with Tailwind styling
 */
export const Checkbox = ({
  checked,
  onChange,
  onBlur,
  label,
  error,
  helpText,
  disabled = false,
  size = 'md',
  className = '',
  id,
  name,
  value,
  truncate = false,
}: CheckboxProps) => {
  const getCheckboxClasses = (): string => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const baseClasses = 'transition-colors duration-200 border-2 rounded focus:outline-none focus:ring-2 focus:ring-opacity-20 accent-primary-500';

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-400 focus:border-primary-500 focus:ring-primary-200';

    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer';

    return [
      baseClasses,
      sizeClasses[size],
      errorClasses,
      disabledClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');
  };

  const getLabelClasses = (): string => {
    const sizeClasses = {
      sm: 'text-sm ml-2',
      md: 'text-base ml-2',
      lg: 'text-lg ml-3',
    };

    const disabledClasses = disabled
      ? 'text-gray-500'
      : 'text-gray-700';

    const truncateClasses = truncate
      ? 'truncate flex-1 min-w-0'
      : '';

    return [
      'transition-colors duration-200 text-left select-none',
      sizeClasses[size],
      disabledClasses,
      truncateClasses,
    ]
      .filter(Boolean)
      .join(' ');
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        className={`flex items-start transition-colors duration-200 rounded-md p-2  focus:outline-none ${truncate ? 'w-full' : ''
          } ${disabled ? 'cursor-not-allowed opacity-50 ' : 'cursor-pointer'}`}
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyDown}
        onBlur={onBlur}
        disabled={disabled}
        aria-pressed={checked}
        aria-label={label || 'Checkbox'}
      >
        <input
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={checked}
          readOnly
          disabled={disabled}
          className={`${getCheckboxClasses()} ${truncate ? 'flex-shrink-0' : ''} pointer-events-none`}
          tabIndex={-1}
        />

        {label && (
          <span
            className={getLabelClasses()}
          >
            {label}
          </span>
        )}
      </button>

      {error && (
        <span className="block text-red-500 text-sm mt-1 ml-7">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span className="block text-gray-600 text-sm mt-1 ml-7">
          {helpText}
        </span>
      )}
    </div>
  );
};

export default Checkbox; 