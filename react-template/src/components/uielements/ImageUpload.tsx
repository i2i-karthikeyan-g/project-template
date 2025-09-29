import React, { useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext';

interface ImageUploadProps {
  value?: File | null;
  imageUrl?: string;
  onChange: (file: File | null) => void;
  onRemoveUrl?: () => void;
  label?: string;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  maxFileSize?: number;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'square' | 'circle';
}

/**
 * Minimal ImageUpload component for logos and profile images
 * Compact design focused on image preview and selection
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = null,
  imageUrl,
  onChange,
  onRemoveUrl,
  label,
  error,
  helpText,
  disabled = false,
  className = '',
  id,
  maxFileSize = 2 * 1024 * 1024, // 2MB default
  size = 'md',
  shape = 'square',
}) => {

  const { showErrorToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-12 h-12';
      case 'md': return 'w-16 h-16';
      case 'lg': return 'w-20 h-20';
      default: return 'w-16 h-16';
    }
  };

  const getShapeClasses = () => {
    return shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  };

  const convertFileSizeBytesToMB = (fileSizeInBytes: number) => {
    return (fileSizeInBytes / (1024 * 1024)).toFixed(1);
  };

  const validateFile = (file: File): string | null => {
    // File type validation - only PNG and JPG
    const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const acceptedExtensions = ['.png', '.jpg', '.jpeg'];
    
    const fileName = file.name.toLowerCase();
    const isValidType = acceptedTypes.includes(file.type) || 
                       acceptedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
      return 'Only PNG and JPG files are supported';
    }

    // File size validation
    if (maxFileSize && file.size > maxFileSize) {
      return `File size exceeds ${convertFileSizeBytesToMB(maxFileSize)}MB limit`;
    }

    return null;
  };

  const createPreviewUrl = (file: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    // Create preview and update state
    createPreviewUrl(file);
    onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChooseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onChange(null);
    if (onRemoveUrl) {
      onRemoveUrl();
    }
  };

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Determine what to show: file preview, URL image, or empty state
  const hasImage = value || imageUrl;
  const displayImageUrl = value ? previewUrl : imageUrl;

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="flex items-start gap-3">
        {/* Image Container */}
        <div className={`${getSizeClasses()} flex-shrink-0`}>
          {hasImage && displayImageUrl ? (
            /* Image Preview */
            <div className={`${getSizeClasses()} ${getShapeClasses()} overflow-hidden border-2 border-gray-200 bg-gray-50`}>
              <img
                src={displayImageUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            /* Empty State - Upload Button */
            <button
              type="button"
              onClick={handleChooseClick}
              disabled={disabled}
              className={`${getSizeClasses()} ${getShapeClasses()} border-2 border-dashed border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center group ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${error ? 'border-red-300 hover:border-red-400' : ''}`}
            >
              <i className="pi pi-plus text-gray-400 group-hover:text-primary-500 transition-colors text-sm"></i>
            </button>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            id={id}
            accept="image/png,image/jpeg,image/jpg,.png,.jpg,.jpeg"
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />
        </div>

        {/* Action Buttons - Always Visible When Image Present */}
        {hasImage && displayImageUrl && !disabled && (
          <div className="flex flex-col gap-1 ml-2">
            <button
              type="button"
              onClick={handleChooseClick}
              className="w-7 h-7 rounded-md bg-primary-100 hover:bg-primary-200 text-primary-700 hover:text-primary-800 transition-colors duration-200 flex items-center justify-center"
              title="Replace image"
              aria-label="Replace image"
            >
              <i className="pi pi-pencil text-xs"></i>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="w-7 h-7 rounded-md bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 transition-colors duration-200 flex items-center justify-center"
              title="Remove image"
              aria-label="Remove image"
            >
              <i className="pi pi-times text-xs"></i>
            </button>
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          {hasImage && displayImageUrl ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                {value ? value.name : 'Current image'}
              </p>
              {value && (
                <p className="text-xs text-gray-500">
                  {(value.size / 1024).toFixed(1)} KB
                </p>
              )}
              <p className="text-xs text-gray-500">
                Click edit to replace or X to remove
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                {helpText || 'Click to upload image'}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG • Max {convertFileSizeBytesToMB(maxFileSize)}MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-2">
          {error}
        </p>
      )}
    </div>
  );
};