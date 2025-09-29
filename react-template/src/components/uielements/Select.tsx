import React from 'react';
import { Dropdown } from 'primereact/dropdown';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  onBlur?: () => void;
  options: SelectOption[];
  label?: string;
  error?: string;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  id?: string;
  filter?: boolean;
}

/**
 * Pure controlled Select component with Tailwind styling and PrimeReact functionality
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  onBlur,
  options,
  label,
  error,
  helpText,
  placeholder = 'Select an option',
  disabled = false,
  size = 'md',
  fullWidth = true,
  className = '',
  id,
  filter = false,
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'h-9 min-h-9',
      md: 'h-11 min-h-11', 
      lg: 'h-14 min-h-14',
    };
    return sizes[size];
  };

  const getColorClasses = () => {
    if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-200';
    return 'border-gray-400 focus:border-primary-500 focus:ring-primary-200';
  };

  const dropdownClasses = `
    w-full transition-colors duration-200 focus:ring-2 focus:outline-none border rounded-md
    ${getSizeClasses()}
    ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : `bg-transparent ${getColorClasses()}`}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const panelClasses = 'border border-gray-300 rounded-md shadow-lg bg-white overflow-hidden';

  const handleChange = (e: any) => {
    onChange(e.value);
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <Dropdown
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        filter={filter}
        className={`${dropdownClasses} [&_.p-dropdown-label]:flex [&_.p-dropdown-label]:items-center [&_.p-dropdown-label]:px-3 [&_.p-dropdown-label]:text-base [&_.p-dropdown-trigger]:w-8 [&_.p-dropdown-trigger]:flex [&_.p-dropdown-trigger]:items-center [&_.p-dropdown-trigger]:justify-center [&:not(.p-disabled):hover]:border-primary-500 [&:not(.p-disabled).p-focus]:border-primary-500 [&:not(.p-disabled).p-focus]:ring-2 [&:not(.p-disabled).p-focus]:ring-primary-200 [&.p-focus]:border-primary-500 [&.p-focus]:ring-2 [&.p-focus]:ring-primary-200`}
        panelClassName={`${panelClasses} [&_.p-dropdown-filter-container_.p-inputtext]:border [&_.p-dropdown-filter-container_.p-inputtext]:border-gray-300 [&_.p-dropdown-filter-container_.p-inputtext]:rounded-md [&_.p-dropdown-filter-container_.p-inputtext]:px-3 [&_.p-dropdown-filter-container_.p-inputtext]:py-2 [&_.p-dropdown-filter-container_.p-inputtext:focus]:border-primary-500 [&_.p-dropdown-filter-container_.p-inputtext:focus]:ring-2 [&_.p-dropdown-filter-container_.p-inputtext:focus]:ring-primary-200 [&_.p-dropdown-filter-container_.p-inputtext:focus]:outline-none`}
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

export default Select; 