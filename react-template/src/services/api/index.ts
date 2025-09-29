/**
 * API Module Index - Single import point for all API functionality
 * Import everything from here: import { api, resources, HTTP_METHODS } from '@/services/api'
 */

// Export main API function
export { api } from './apiService';

// Export resources (includes endpoints)
export { resources } from './apiresources';

// Export constants
export { 
  HTTP_METHODS, 
  API_CONTENT_TYPES,  
} from './apiConstants';

// Export types
export type { 
  ApiMethod, 
  ApiContentType, 
  ApiRequest, 
  ApiResponse, 
  ApiError,
  ApiPaginatedResponse
} from './apitypes';

// Export axios instance if needed directly
export { default as axiosInstance } from './axiosInstance'; 