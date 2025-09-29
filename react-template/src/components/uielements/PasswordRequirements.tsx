import React from 'react';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

const requirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8,
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter',
    test: (password: string) => /(?=.*[a-z])/.test(password),
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    test: (password: string) => /(?=.*[A-Z])/.test(password),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (password: string) => /(?=.*\d)/.test(password),
  },
];

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  className = '',
}) => {
  return (
    <div className={`mt-2 space-y-1 ${className}`}>
      <p className="text-xs font-medium text-gray-600 mb-2">Password requirements:</p>
      <div className="space-y-1">
        {requirements.map((requirement) => {
          const isMet = requirement.test(password);
          const hasValue = password.length > 0;
          
          return (
            <div key={requirement.id} className="flex items-center space-x-2">
              <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                !hasValue 
                  ? 'border-gray-300 bg-gray-50' 
                  : isMet 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-red-500 bg-red-500'
              }`}>
                {hasValue && isMet && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {hasValue && !isMet && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-xs ${
                !hasValue 
                  ? 'text-gray-500' 
                  : isMet 
                    ? 'text-green-600' 
                    : 'text-red-600'
              }`}>
                {requirement.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordRequirements; 