/**
 * Route paths constants for the application
 * Centralized location for all route definitions
 */

// Public Routes (accessible without authentication)
export const PUBLIC_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
} as const;

// Protected Routes (require authentication)
export const PROTECTED_ROUTES = {
  HOME: '/',
  USERS: '/users',
  CLIENT_USERS: '/client-users',
  CLIENTS: '/clients',
  CLIENTS_ADD: '/clients/add',
  CLIENTS_EDIT: '/clients/edit/:id',
  CLIENTS_VIEW: '/clients/view/:id',
  PROFILE: '/profile',
} as const;


// Special Routes
export const SPECIAL_ROUTES = {
  NOT_FOUND: '*',
} as const;

// Combined routes object for easy access
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
  ...SPECIAL_ROUTES,
} as const;

// Type definitions for route paths
export type PublicRoutePath = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];
export type ProtectedRoutePath = typeof PROTECTED_ROUTES[keyof typeof PROTECTED_ROUTES];
export type RoutePath = typeof ROUTES[keyof typeof ROUTES]; 