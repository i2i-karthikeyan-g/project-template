import React from 'react';
import { MultiSelect as PrimeMultiSelect } from 'primereact/multiselect';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface MultiSelectProps {
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
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
  display?: 'comma' | 'chip';
  maxSelectedLabels?: number;
}


export const MultiSelect: React.FC<MultiSelectProps> = ({
  value,
  onChange,
  onBlur,
  options,
  label,
  error,
  helpText,
  placeholder = 'Select options',
  disabled = false,
  size = 'md',
  fullWidth = true,
  className = '',
  id,
  filter = false,
  display = 'comma',
  maxSelectedLabels,
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

  const multiSelectClasses = `
    w-full transition-colors duration-200 focus:ring-2 focus:outline-none border rounded-md
    ${getSizeClasses()}
    ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : `bg-transparent ${getColorClasses()}`}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const panelClasses = 'border border-gray-300 rounded-md shadow-lg bg-white overflow-hidden';

  const checkboxStyles = `
    [&_.p-checkbox]:border-2 [&_.p-checkbox]:border-gray-400 
    [&_.p-checkbox]:transition-colors [&_.p-checkbox]:duration-200 [&_.p-checkbox]:focus:outline-none 
    [&_.p-checkbox]:focus:ring-2 [&_.p-checkbox]:focus:ring-opacity-20 [&_.p-checkbox]:focus:ring-primary-200
    [&_.p-checkbox]:hover:border-primary-500 
    [&_.p-checkbox.p-highlight]:border-primary-500 [&_.p-checkbox.p-highlight]:bg-primary-500 
    [&_.p-checkbox:has(input:checked)]:border-primary-500 [&_.p-checkbox:has(input:checked)]:bg-primary-500 
    [&_.p-checkbox-box]:w-full [&_.p-checkbox-box]:h-full [&_.p-checkbox-box]:flex 
    [&_.p-checkbox-box]:items-center [&_.p-checkbox-box]:justify-center
    [&_.p-checkbox.p-highlight_.p-checkbox-box]:bg-primary-500
    [&_.p-checkbox:has(input:checked)_.p-checkbox-box]:bg-primary-500
    [&_.p-checkbox-icon]:text-white [&_.p-checkbox-icon]:w-3 [&_.p-checkbox-icon]:h-3
  `.trim().replace(/\s+/g, ' ');

  const handleChange = (e: any) => {
    onChange(e.value || []);
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <PrimeMultiSelect
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        filter={filter}
        display={display}
        showSelectAll={true}    
        // selectAllLabel="Select All"//TODO : when click select all label, it should select all options
        showClear={true}
        maxSelectedLabels={maxSelectedLabels}
        className={`${multiSelectClasses} [&_.p-multiselect-label-container]:flex [&_.p-multiselect-label-container]:items-center [&_.p-multiselect-label-container]:px-3 [&_.p-multiselect-label-container]:text-base [&_.p-multiselect-trigger]:w-8 [&_.p-multiselect-trigger]:flex [&_.p-multiselect-trigger]:items-center [&_.p-multiselect-trigger]:justify-center [&:not(.p-disabled):hover]:border-primary-500 [&:not(.p-disabled).p-focus]:border-primary-500 [&:not(.p-disabled).p-focus]:ring-2 [&:not(.p-disabled).p-focus]:ring-primary-200 [&.p-focus]:border-primary-500 [&.p-focus]:ring-2 [&.p-focus]:ring-primary-200`}
        panelClassName={`${panelClasses} [&_.p-multiselect-filter-container_.p-inputtext]:border [&_.p-multiselect-filter-container_.p-inputtext]:border-gray-300 [&_.p-multiselect-filter-container_.p-inputtext]:rounded-md [&_.p-multiselect-filter-container_.p-inputtext]:px-3 [&_.p-multiselect-filter-container_.p-inputtext]:py-2 [&_.p-multiselect-filter-container_.p-inputtext:focus]:border-primary-500 [&_.p-multiselect-filter-container_.p-inputtext:focus]:ring-2 [&_.p-multiselect-filter-container_.p-inputtext:focus]:ring-primary-200 [&_.p-multiselect-filter-container_.p-inputtext:focus]:outline-none ${checkboxStyles}`}
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

export default MultiSelect; 