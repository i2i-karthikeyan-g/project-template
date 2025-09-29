/**
 * User Service - API integration for user management
 */
import { api, resources } from '../../services/api';
import type { ApiResponse } from '../../services/api';
import type { IUserForm, IUser, IGetUsersParams } from './user.types';

/**
 * Get all users with pagination and search
 */
export const processGetAllUsers = async (params: IGetUsersParams = {}): Promise<ApiResponse<{ users: IUser[]; total: number; page: number; limit: number }>> => {
  const { page = 1, limit = 10, search } = params;

  const { method, url } = resources.users.getAll;
  const queryParams: Record<string, any> = {
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  };

  const response = await api({
    method,
    url: url(queryParams),
  });
  return response;
};



/**
 * Create new user
 */
export const processCreateUser = async (formData: IUserForm): Promise<ApiResponse<{ user: IUser }>> => {
  const { method, url } = resources.users.create;
  const response = await api({
    method,
    url,
    data: formData
  });
  return response;
};

/**
 * Update user
 */
export const processUpdateUser = async (id: string, formData: IUserForm): Promise<ApiResponse<{ user: IUser }>> => {
  const { method, url } = resources.users.update;
  const response = await api({
    method,
    url: url(id),
    data: formData
  });
  return response;
};

/**
 * Delete user
 */
export const processDeleteUser = async (id: string): Promise<ApiResponse<null>> => {
  const { method, url } = resources.users.delete;
  const response = await api({
    method,
    url: url(id)
  });
  return response;
};

/**
 * Deactivate user
 */
export const processDeactivateUser = async (id: string): Promise<ApiResponse<null>> => {
  const { method, url } = resources.users.deactivate;
  const response = await api({
    method,
    url: url(id)
  });
  return response;
}; 