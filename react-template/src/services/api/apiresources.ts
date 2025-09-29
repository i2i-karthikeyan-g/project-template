/**
 * API Resources - All endpoints with their methods in single object
 * This includes both the HTTP method and URL for each endpoint
 */
import { HTTP_METHODS } from './apiConstants';

const ENTITIES = {
  USERS: '/api/users',
  CLIENT_USERS: '/api/users/clients',
  AUTH: '/api/auth',
  CLIENTS: '/api/clients',
}

export const resources = {
  auth: {
    login: {
      method: HTTP_METHODS.POST,
      url: `${ENTITIES.AUTH}/token`
    },
    signup: {
      method: HTTP_METHODS.POST,
      url: `${ENTITIES.AUTH}/signup`
    },
    logout: {
      method: HTTP_METHODS.POST,
      url: `${ENTITIES.AUTH}/logout`
    },
    refresh: {
      method: HTTP_METHODS.POST,
      url: `${ENTITIES.AUTH}/refresh`
    },
    verifyEmail: {
      method: HTTP_METHODS.POST,
      url: `${ENTITIES.AUTH}/verify-email`
    },
    forgotPassword: {
      method: HTTP_METHODS.POST,
      url: `${ENTITIES.AUTH}/forgot-password`
    },
    resetPassword: {
      method: HTTP_METHODS.POST,
      url: `${ENTITIES.AUTH}/reset-password`
    },
    me: {
      method: HTTP_METHODS.GET,
      url: `${ENTITIES.AUTH}/me`
    }
  },
  users: {
    getAll: {
      method: HTTP_METHODS.GET,
      url: (queryParams: Record<string, string>) => {
        const query = new URLSearchParams(queryParams).toString();
        return `${ENTITIES.USERS}/?${query}`;
      }
    },
    create: {
      method: HTTP_METHODS.POST,
      url: `${ENTITIES.AUTH}/register`
    },
    update: {
      method: HTTP_METHODS.PUT,
      url: (id: string) => `${ENTITIES.USERS}/${id}`
    },
    delete: {
      method: HTTP_METHODS.DELETE,
      url: (id: string) => `${ENTITIES.USERS}/${id}`
    },
    deactivate: {
      method: HTTP_METHODS.PUT,
      url: (id: string) => `${ENTITIES.USERS}/${id}/deactivate`
    }
  },
  clients: {
    getAll: {
      method: HTTP_METHODS.GET,
      url: (queryParams: Record<string, string>) => {
        const query = new URLSearchParams(queryParams).toString();
        return `${ENTITIES.CLIENTS}/?${query}`;
      }
    },
    getById: {
      method: HTTP_METHODS.GET,
      url: (id: string) => `${ENTITIES.CLIENTS}/${id}`
    },
    create: {
      method: HTTP_METHODS.POST,
      url: `${ENTITIES.CLIENTS}/`
    },
    update: {
      method: HTTP_METHODS.PUT,
      url: (id: string) => `${ENTITIES.CLIENTS}/${id}`
    },
    delete: {
      method: HTTP_METHODS.DELETE,
      url: (id: string) => `${ENTITIES.CLIENTS}/${id}`
    }
  },
} as const; 