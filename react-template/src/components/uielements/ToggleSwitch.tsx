import React from 'react';


interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  id,
}) => {

  const switchClasses = [
    'transition-colors duration-200',
    checked ? 'bg-primary-600 border-primary-600' : 'bg-gray-200 border-gray-300',
    'border-2 rounded-full w-14 h-8 flex items-center',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ].join(' ');

  const knobClasses = [
    'bg-white w-6 h-6 rounded-full shadow transform transition-transform duration-200',
    checked ? 'translate-x-6' : 'translate-x-1',
  ].join(' ');

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        id={id}
        className={switchClasses}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        aria-checked={checked}
        role="switch"
      >
        <span className={knobClasses} />
      </button>
      {label && <label htmlFor={id} className="text-sm text-gray-700 select-none cursor-pointer">{label}</label>}
    </div>
  );
};

export default ToggleSwitch; 