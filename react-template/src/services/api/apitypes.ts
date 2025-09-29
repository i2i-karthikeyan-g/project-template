/**
 * API Types - TypeScript interfaces and types for the API system
 */
import { HTTP_METHODS, API_CONTENT_TYPES } from './apiConstants';

export type ApiMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];
export type ApiContentType = typeof API_CONTENT_TYPES[keyof typeof API_CONTENT_TYPES];

export interface ApiRequest {
  method: ApiMethod;
  url: string;
  data?: any;
  options?: {
    contentType?: ApiContentType;
    headers?: Record<string, string>;
  };
}

export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
}

// Paginated response type for list operations
export interface ApiPaginatedResponse<T = any> {
  data: T & {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

