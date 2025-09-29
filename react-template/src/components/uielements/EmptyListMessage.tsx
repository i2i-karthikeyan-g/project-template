interface EmptyListMessageProps {
    text?: string;
    icon?: string;
    className?: string;
}

/**
 * Reusable empty state component for lists and tables
 * Shows a centered message with optional icon
 */
export const EmptyListMessage = ({ 
    text = "No data found", 
    icon, 
    className = "" 
}: EmptyListMessageProps) => {
    return (
        <div className={`text-center py-12 ${className}`}>
            {icon && (
                <i className={`${icon} text-4xl text-gray-300 mb-4 block`} />
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{text}</h3>
        </div>
    );
}; 