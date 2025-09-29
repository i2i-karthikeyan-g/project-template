import React, { useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { getColoredFileIcon } from '../../utils/fileUtils';

interface FileUploadProps {
  value?: File[];
  onChange: (files: File[]) => void;
  label?: string;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  id?: string;
  accept?: string;
  maxFileSize?: number;
  maxFileCount?: number;
  multiple?: boolean;
  dragDropText?: string;
}

/**
 * Clean and simple FileUpload component with consistent button text
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  value = [],
  onChange,
  label,
  error,
  helpText,
  disabled = false,
  fullWidth = true,
  className = '',
  id,
  accept,
  maxFileSize = 1 * 1024 * 1024, // 1MB default
  maxFileCount,
  multiple = false,
  dragDropText = 'Drag and drop files here or click to browse',
}) => {

  const { showErrorToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragOver, setIsDragOver] = useState(false);

  const convertFileSizeBytesToMB = (fileSizeInBytes: number) => {
    return (fileSizeInBytes / (1024 * 1024)).toFixed(1);
  }

  const validateFile = (file: File): string | null => {

    // File type validation
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim().toLowerCase());
      const fileName = file.name.toLowerCase();

      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          // Extension check (e.g., .txt, .pdf)
          return fileName.endsWith(type);
        } else if (type.includes('/')) {
          // MIME type check (e.g., text/plain, image/*)
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('*', ''));
          }
          return file.type === type;
        }
        return false;
      });

      if (!isValidType) {
        const acceptedExtensions = acceptedTypes
          .filter(type => type.startsWith('.'))
          .join(', ');
        return `Only ${acceptedExtensions} files are supported`;

      }
    }

    // File size validation
    if (maxFileSize && file.size > maxFileSize) {
      return `File size exceeds ${convertFileSizeBytesToMB(maxFileSize)}MB limit`;
    }

    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    let validationError: string | null = null;

    for (const file of fileArray) {
      const error = validateFile(file);
      if (!error) {
        validFiles.push(file);
      } else {
        validationError = error;
        break; // Stop on first error
      }
    }

    if (validationError) {
      showErrorToast(validationError);
      return; // Don't add invalid files
    }

    // Check file count limit
    if (multiple && maxFileCount !== undefined) {
      const newTotalCount = value.length + validFiles.length;
      if (newTotalCount > maxFileCount) {
        showErrorToast(`Maximum ${maxFileCount} files allowed`);
        return; // Don't add files if it would exceed the limit
      }
    }

    // If all validation passes, update the files
    if (multiple) {
      onChange([...value, ...validFiles]);
    } else {
      onChange(validFiles.slice(0, 1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (fileToRemove: File) => {
    const remainingFiles = value.filter((file) => file !== fileToRemove);
    onChange(remainingFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleChooseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up
    handleChooseClick();
  };

  const getButtonClasses = () => {
    if (error) return 'border-red-400 bg-red-50';
    if (isDragOver) return 'border-primary-500 bg-primary-50';
    return 'border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-primary-50';
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <button
        className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${getButtonClasses()} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleChooseClick}
        tabIndex={disabled ? -1 : 0}
        type='button'
        aria-label="File upload area"
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className={`bg-primary-600 hover:bg-primary-700 text-white border-primary-600 hover:border-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 mb-3 
            ${disabled ? ' opacity-50 cursor-not-allowed' : ''
            }`}
        >
          <i className="pi pi-fw pi-plus mr-2"></i>
          {multiple ? 'Choose Files' : 'Choose File'}
        </button>

        <div>
          <i className="pi pi-cloud-upload text-2xl text-gray-400 mb-2 block"></i>
          <p className="text-gray-600 text-sm mb-1">{dragDropText}</p>
          <div className="text-xs text-gray-500 space-y-1">
            {accept ? (
              <p>
                Accepted formats: {accept.split(',').map(type => type.trim()).join(', ')}
              </p>
            ) : null}
            {maxFileSize ? (
              <p>
                Max file size: {convertFileSizeBytesToMB(maxFileSize)}MB
              </p>
            ) : null}
            {multiple && maxFileCount ? (
              <p>
                Max files: {maxFileCount}
              </p>
            ) : null}
          </div>
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <span className="block text-red-500 text-sm mt-2">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span className="block text-gray-600 text-sm mt-1">
          {helpText}
        </span>
      )}

      {/* Selected Files Display */}
      {value.length > 0 && (
        <div className="mt-3 space-y-2">
          {value.map((file, index) => (
            <div key={index + file.name} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <i className={`${getColoredFileIcon(file.name)} mr-3 text-lg`}></i>
                <div>
                  <div className="text-sm font-medium text-gray-700">{file.name}</div>
                  <div className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(file)}
                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                disabled={disabled}
                title="Remove file"
              >
                <i className="pi pi-times text-sm"></i>
              </button>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}; 