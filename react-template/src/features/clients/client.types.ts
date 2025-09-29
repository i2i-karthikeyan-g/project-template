export interface IUserForm {
  name: string;
  email: string;
}

export interface IClientForm {
  name: string;
  industry: string;
  website: string;
  primaryContactName: string;
  primaryMailAddress: string;
  number: string;
  country: string;
  user: IUserForm;
  logo?: File;
}

export interface ISolutionInfo {
  id: number;
  name: string;
  description?: string;
}

export interface IClient extends Omit<IClientForm, 'solutionIds' | 'logo' | 'user'> {
  id: number;
  logoUrl?: string;
  primaryAdminUserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface IGetClientsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IClientListResponse {
  clients: IClient[];
  total: number;
  page: number;
}
