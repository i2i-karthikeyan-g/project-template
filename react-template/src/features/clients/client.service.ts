import { api, resources, API_CONTENT_TYPES } from '../../services/api';
import type { ApiPaginatedResponse, ApiResponse } from '../../services/api';
import type { 
  IClient, 
  IClientForm, 
  IGetClientsParams,
  IClientListResponse
} from './client.types';

export const processGetAllClients = async (
  params: IGetClientsParams = {}
): Promise<ApiPaginatedResponse<IClientListResponse>> => {
  const { page = 1, limit = 10, search } = params;
  
  const { method, url } = resources.clients.getAll;
  const queryParams: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  };
  
  const response = await api({ 
    method, 
    url: url(queryParams)
  });
  
  return response;
};

export const processGetClientById = async (
  id: string
): Promise<ApiResponse<{ client: IClient }>> => {
  const { method, url } = resources.clients.getById;
  const response = await api({ 
    method, 
    url: url(id)
  });
  
  return response;
};

export const processCreateClient = async (
  formData: IClientForm
): Promise<ApiResponse<IClient>> => {
  const { method, url } = resources.clients.create;
  
  // Backend expects FormData with specific field names
  const uploadData = new FormData();
  
  // Append organization fields
  uploadData.append('name', formData.name);
  uploadData.append('industry', formData.industry);
  uploadData.append('solution_ids', formData.solutionIds.join(','));
  uploadData.append('website', formData.website);
  uploadData.append('primary_contact_name', formData.primaryContactName);
  uploadData.append('primary_mail_address', formData.primaryMailAddress);
  uploadData.append('number', formData.number);
  uploadData.append('country', formData.country);
  
  // Append user fields separately (not as nested object)
  uploadData.append('user_name', formData.user.name);
  uploadData.append('user_email', formData.user.email);
  
  // Append logo if present
  if (formData.logo) {
    uploadData.append('logo', formData.logo);
  }
  
  const response = await api({ 
    method, 
    url, 
    data: uploadData,
    options: { contentType: API_CONTENT_TYPES.FORM_DATA }
  });
  
  return response;
};

export const processUpdateClient = async (
  id: string,
  formData: Partial<IClientForm>
): Promise<ApiResponse<IClient>> => {
  const { method, url } = resources.clients.update;
  
  // Remove user from update data since users are only created during organization creation
  const { user, ...updateData } = formData;
  
  // Backend expects FormData for updates (even without logo)
  const uploadData = new FormData();
  
  // Append all organization fields that are being updated
  if (updateData.name !== undefined) uploadData.append('name', updateData.name);
  if (updateData.industry !== undefined) uploadData.append('industry', updateData.industry);
  if (updateData.solutionIds !== undefined) uploadData.append('solution_ids', updateData.solutionIds.join(','));
  if (updateData.website !== undefined) uploadData.append('website', updateData.website);
  if (updateData.primaryContactName !== undefined) uploadData.append('primary_contact_name', updateData.primaryContactName);
  if (updateData.primaryMailAddress !== undefined) uploadData.append('primary_mail_address', updateData.primaryMailAddress);
  if (updateData.number !== undefined) uploadData.append('number', updateData.number);
  if (updateData.country !== undefined) uploadData.append('country', updateData.country);
  
  // Append logo if present
  if (updateData.logo) {
    uploadData.append('logo', updateData.logo);
  }
  
  const response = await api({ 
    method, 
    url: url(id), 
    data: uploadData,
    options: { contentType: API_CONTENT_TYPES.FORM_DATA }
  });
  
  return response;
};

export const processDeleteClient = async (
  id: string
): Promise<ApiResponse<null>> => {
  const { method, url } = resources.clients.delete;
  const response = await api({ 
    method, 
    url: url(id)
  });
  
  return response;
};
