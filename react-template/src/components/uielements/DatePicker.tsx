import React from 'react';
import { Calendar } from 'primereact/calendar';

interface DatePickerProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
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
  dateFormat?: string;
  showIcon?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  hourFormat?: '12' | '24';
  timeOnly?: boolean;
}

/**
 * Pure controlled DatePicker component with Tailwind styling and PrimeReact functionality
 * Supports date, time, and datetime selection with 12/24 hour formats
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  onBlur,
  label,
  error,
  helpText,
  placeholder = 'Select a date',
  disabled = false,
  size = 'md',
  fullWidth = true,
  className = '',
  id,
  dateFormat = 'dd/mm/yy',
  showIcon = true,
  minDate,
  maxDate,
  showTime = false,
  hourFormat = '24',
  timeOnly = false,
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };
    return sizes[size];
  };

  const getColorClasses = () => {
    if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-200';
    return 'border-gray-400 focus:border-primary-500 focus:ring-primary-200';
  };

  const inputClasses = `
    w-full transition-colors duration-200 focus:ring-2 focus:outline-none
    ${showIcon ? 'border-l border-t border-b rounded-l-md' : 'border rounded-md'}
    ${getSizeClasses()}
    ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : `bg-transparent ${getColorClasses()}`}
    focus:shadow-none !focus:shadow-none !focus:border-primary-500 !focus:ring-primary-200 !focus:ring-2
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const handleChange = (e: any) => {
    onChange(e.value);
  };


  // Get appropriate date format based on time settings
  const getDateFormat = () => {
    if (timeOnly) return hourFormat === '12' ? 'hh:mm tt' : 'HH:mm';
    // When showTime is true, PrimeReact automatically adds time format
    // Don't manually add time format to avoid duplication
    return dateFormat;
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <Calendar
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
      disabled={disabled}
      dateFormat={getDateFormat()}
      showIcon={showIcon}
      minDate={minDate}
      maxDate={maxDate}
      showTime={showTime}
      hourFormat={hourFormat}
      timeOnly={timeOnly}
      className="w-full [&_.p-inputtext]:!shadow-none [&_.p-inputtext]:focus:!shadow-none [&_.p-inputtext]:focus:!border-transparent [&_.p-inputtext]:focus:!outline-none [&_.p-calendar]:!shadow-none [&_.p-calendar.p-focus]:!shadow-none [&_.p-calendar.p-focus]:!border-transparent [&_.p-calendar.p-focus]:!outline-none [&_.p-datepicker-trigger]:bg-primary-500 [&_.p-datepicker-trigger]:border-primary-500 [&_.p-datepicker-trigger]:border-r [&_.p-datepicker-trigger]:border-t [&_.p-datepicker-trigger]:border-b [&_.p-datepicker-trigger]:rounded-r-md [&_.p-datepicker-trigger]:text-white [&_.p-datepicker-trigger:hover]:bg-primary-600 [&_.p-datepicker-trigger:focus]:border-primary-500 [&_.p-datepicker-trigger:focus]:!shadow-none [&_.p-datepicker-trigger:focus]:!outline-none"
      inputClassName={inputClasses}
      panelClassName="border border-gray-300 rounded-md shadow-lg bg-white"
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

export default DatePicker; 