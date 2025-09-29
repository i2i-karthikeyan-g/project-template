/**
 * Environment Configuration
 * Centralized access to environment variables with type safety
 */

interface EnvironmentConfig {
    VITE_API_BASE_URL: string;
}

export const ENVIRONMENT: EnvironmentConfig = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
};



// Environment type for development/production checks
export const NODE_ENV = import.meta.env.MODE;
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_PRODUCTION = NODE_ENV === 'production'; 