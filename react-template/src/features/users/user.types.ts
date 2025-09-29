export interface IUserForm {
  name: string;
  email: string;
  username?: string;
  role: string;
  isActive?: boolean;
  password?: string;
  confirmPassword?: string;
}

export interface IUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


// Query parameters interface for pagination
export interface IGetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
} 