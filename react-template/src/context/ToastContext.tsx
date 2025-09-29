import React, { createContext, useContext, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Toast } from 'primereact/toast';
import type { ToastMessage } from 'primereact/toast';

// Toast options interface extending PrimeReact's ToastMessage
interface ToastOptions {
  severity?: 'success' | 'info' | 'warn' | 'error';
  summary?: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
}

// Context interface
interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  showSuccessToast: (summary: string, detail?: string) => void;
  showErrorToast: (summary: string, detail?: string) => void;
  showWarningToast: (summary: string, detail?: string) => void;
  showInfoToast: (summary: string, detail?: string) => void;
  clear: () => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider props interface
interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast Provider component that wraps the application with toast functionality
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastRef = useRef<Toast>(null);

  // Main toast function
  const showToast = (options: ToastOptions): void => {
    toastRef.current?.show({
      severity: options.severity ?? 'info',
      summary: options.summary ?? '',
      detail: options.detail ?? '',
    } as ToastMessage);
  };

  // Convenience methods for different toast types
  const showSuccessToast = (detail: string): void => {
    showToast({
      severity: 'success',
      summary: TOAST_SUMMARY_MSG.SUCCESS,
      detail,
    });
  };

  const showErrorToast = (detail: string): void => {
    showToast({
      severity: 'error',
      summary: TOAST_SUMMARY_MSG.ERROR,
      detail,
    });
  };

  const showWarningToast = (detail: string): void => {
    showToast({
      severity: 'warn',
      summary: TOAST_SUMMARY_MSG.WARNING,
      detail,
    });
  };

  const showInfoToast = (detail: string): void => {
    showToast({
      severity: 'info',
      summary: TOAST_SUMMARY_MSG.INFO,
      detail,
    });
  };

  // Clear all toasts
  const clear = (): void => {
    toastRef.current?.clear();
  };

  const contextValue: ToastContextType = useMemo(() => ({
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    clear,
  }), []);

  return (
    <ToastContext.Provider value={contextValue}>
      <Toast ref={toastRef} baseZIndex={9999} />
      {children}
    </ToastContext.Provider>
  );
};

/**
 * Custom hook to use toast functionality
 * @returns ToastContextType object with toast methods
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};

export const TOAST_SUMMARY_MSG = {
  SUCCESS: 'Success',
  ERROR: 'Error',
  WARNING: 'Warning',
  INFO: 'Info'
} as const;

// Default export for better React Fast Refresh support
export default ToastProvider; 