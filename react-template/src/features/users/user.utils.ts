import { USER_ROLES } from '../../context/auth/permissions.constants';
import { DatetimeUtils, DATE_FORMAT } from '../../utils/dateTimeUtils';

/**
 * Format user role for display
 */
export const formatUserRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

/**
 * Format user status for display
 */
export const formatUserStatus = (isActive: boolean): string => {
  return isActive ? 'Active' : 'Inactive';
};

/**
 * Get user status color class
 */
export const getUserStatusColorClass = (isActive: boolean): string => {
  return isActive ? 'text-green-600' : 'text-red-600';
};

/**
 * Get user role color class
 */
export const getUserRoleColorClass = (role: string): string => {
  switch (role.toLowerCase()) {
    case USER_ROLES.SUPER_ADMIN:
      return 'text-green-700';
    case USER_ROLES.ADMIN:
      return 'text-purple-600';
    case USER_ROLES.USER:
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Format user creation date
 */
export const formatUserDate = (dateString: string): string => {
  return DatetimeUtils.format(dateString, DATE_FORMAT.FULL_DATE_TIME);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

/**
 * Generate username from email
 */
export const generateUsernameFromEmail = (email: string): string => {
  return email.split('@')[0].toLowerCase();
}; 