/**
 * API Constants - HTTP methods, content types
 * No endpoints here - they are defined in resources.ts
 */

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch'
} as const;

// Content Types
export const API_CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  FORM_URL_ENCODED: 'application/x-www-form-urlencoded'
} as const;

