import { useCallback } from 'react';
import { Input } from './Input';
import { useDebounceCallback } from '../../hooks/useDebounce';

interface InputSearchProps {
    value: string;
    onChange: (value: string) => void;
    onDebouncedChange?: (value: string) => void;
    delay?: number;

    id?: string;
    placeholder?: string;
    label?: string;
    error?: string;
    helpText?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    className?: string;
    type?: string;
    onBlur?: () => void;
}

/**
 * InputSearch component that encapsulates search functionality with debouncing
 * 
 * Features:
 * - Built-in debouncing for API calls
 * - Automatic search icon and clear button
 * - Consistent styling with base Input component
 * - Handles clear functionality properly
 * 
 * @example
 * // Basic usage
 * <InputSearch
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   onDebouncedChange={(value) => fetchData({ search: value })}
 *   placeholder="Search"
 * />
 */
export const InputSearch = ({
    value,
    onChange,
    onDebouncedChange,
    delay = 500,
    id,
    placeholder = "Search",
    label,
    error,
    helpText,
    disabled = false,
    size = 'md',
    fullWidth = true,
    className = '',
    type = 'text',
    onBlur,
}: InputSearchProps) => {

    const debouncedCallback = useDebounceCallback(
        useCallback((searchValue: string) => {
            if (onDebouncedChange) {
                onDebouncedChange(searchValue);
            }
        }, [onDebouncedChange]),
        delay
    );

    const handleInputChange = useCallback((newValue: string) => {
        onChange(newValue);
        debouncedCallback(newValue);
    }, [onChange, debouncedCallback]);

    const handleClear = useCallback(() => {
        onChange('');
        debouncedCallback('');
    }, [onChange, debouncedCallback]);



    return (
        <Input
            id={id}
            type={type}
            value={value}
            onChange={handleInputChange}
            onBlur={onBlur}
            onClear={handleClear}
            label={label}
            error={error}
            helpText={helpText}
            placeholder={placeholder}
            disabled={disabled}
            size={size}
            fullWidth={fullWidth}
            className={className}
            leftIcon="pi pi-search"
            showClearButton={true}
        />
    );
};

export default InputSearch;
