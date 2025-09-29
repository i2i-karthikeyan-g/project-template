import { useState, useEffect } from 'react';
import { DeleteConfirmDialog } from '../../components/uielements/dialog/DeleteConfirmDialog';
import { CustomButton } from '../../components/uielements/CustomButton';
import { CustomDialog } from '../../components/uielements/dialog/CustomDialog';
import { InputSearch } from '../../components/uielements/InputSearch';
import { DataTable, useDataTablePagination, type ColumnConfig } from '../../components/uielements/datatable/DataTable';
import { EmptyListMessage } from '../../components/uielements/EmptyListMessage';
import { UserForm } from './components/UserForm';
import { processGetAllUsers, processCreateUser, processUpdateUser, processDeleteUser } from './user.service';
import { useToast } from '../../context/ToastContext';
import { useAuthContext } from '../../context/auth/AuthContext';
import { RESOURCES } from '../../context/auth/permissions.constants';
import type { IUser, IUserForm } from './user.types';
import { formatUserRole, formatUserStatus, getUserStatusColorClass, getUserRoleColorClass, formatUserDate } from './user.utils';
import { getNameInitials } from '../../utils/functions';

export const UsersListScreen = () => {
  const { showSuccessToast, showErrorToast } = useToast();
  const { canCreate, canUpdate, canDelete } = useAuthContext();

  const { currentPage, rowsPerPage, first, totalRecords,
    handlePageChange, setTotalRecords } = useDataTablePagination();

  const [users, setUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [formLoading, setFormLoading] = useState(false);


  useEffect(() => {
    getAllUsers({ page: currentPage, limit: rowsPerPage, search: searchTerm });
  }, [currentPage, rowsPerPage]);

  const handleAdd = () => {
    setShowAddDialog(true);
  };

  const handleEdit = (user: IUser) => {
    setEditingUser(user);
  };

  const handleDelete = (user: IUser) => {
    setUserToDelete(user);
  };

  const onDebouncedSearchChange = (value: string) => {
    getAllUsers({ page: currentPage, limit: rowsPerPage, search: value });
  };

  const handleAddSubmit = async (data: IUserForm) => {
    await createUser(data);
  };

  const handleEditSubmit = async (data: IUserForm) => {
    await updateUser(data);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    await deleteUser(userToDelete);
  };

  const handleDialogClose = () => {
    setShowAddDialog(false);
    setEditingUser(null);
  };

  const getAllUsers = async (params: { page: number; limit: number; search?: string }) => {
    setLoading(true);
    try {
      const response = await processGetAllUsers(params);
      setUsers(response.data.users || []);
      setTotalRecords(response.data.total || 0);
    } catch (error: any) {
      showErrorToast(error.message);
      setUsers([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: IUserForm) => {
    setFormLoading(true);
    try {
      const response = await processCreateUser(data);
      showSuccessToast(response?.message || 'User created successfully');
      setShowAddDialog(false);
      getAllUsers({ page: currentPage, limit: rowsPerPage, search: searchTerm });
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setFormLoading(false);
    }
  };

  const updateUser = async (data: IUserForm) => {
    if (!editingUser) return;

    setFormLoading(true);
    try {
      const response = await processUpdateUser(editingUser.id.toString(), data);
      showSuccessToast(response?.message || 'User updated successfully');
      setEditingUser(null);
      getAllUsers({ page: currentPage, limit: rowsPerPage, search: searchTerm });
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setFormLoading(false);
    }
  };

  const deleteUser = async (user: IUser) => {
    try {
      const response = await processDeleteUser(user.id.toString());
      showSuccessToast(response?.message || 'User deleted successfully');
      getAllUsers({ page: currentPage, limit: rowsPerPage, search: searchTerm });
    } catch (error: any) {
      showErrorToast(error?.message);
    }
    setUserToDelete(null);
  };

  const nameBodyTemplate = (rowData: IUser) => {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 min-w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-primary-600 text-sm font-semibold">
            {getNameInitials(rowData.name)}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{rowData.name}</div>
          <div className="text-sm text-gray-500">{rowData.email}</div>
        </div>
      </div>
    );
  };

  const usernameBodyTemplate = (rowData: IUser) => {
    return (
      <div className="text-sm text-gray-700">
        {rowData.username}
      </div>
    );
  };



  const roleBodyTemplate = (rowData: IUser) => {
    return (
      <span className={`text-sm font-medium ${getUserRoleColorClass(rowData.role)}`}>
        {formatUserRole(rowData.role)}
      </span>
    );
  };

  const statusBodyTemplate = (rowData: IUser) => {
    return (
      <span className={`text-sm font-medium ${getUserStatusColorClass(rowData.isActive ?? false)}`}>
        {formatUserStatus(rowData.isActive ?? false)}
      </span>
    );
  };

  const dateBodyTemplate = (rowData: IUser) => {
    return (
      <div className="text-sm text-gray-600">
        {formatUserDate(rowData.createdAt)}
      </div>
    );
  };

  const updatedDateBodyTemplate = (rowData: IUser) => {
    return (
      <div className="text-sm text-gray-600">
        {formatUserDate(rowData.updatedAt)}
      </div>
    );
  };

  const actionBodyTemplate = (rowData: IUser) => {
    return (
      <div className="flex items-center gap-2">
        {canUpdate(RESOURCES.USERS) && (
          <CustomButton
            variant="ghost"
            size="sm"
            icon="pi pi-pencil text-primary-600"
            onClick={() => handleEdit(rowData)}
            title="Edit"
          />
        )}
        {canDelete(RESOURCES.USERS) && (
          <CustomButton
            variant="ghost"
            size="sm"
            icon="pi pi-trash text-red-600"
            onClick={() => handleDelete(rowData)}
            title="Delete"
          />
        )}
      </div>
    );
  };

  const userColumns: ColumnConfig<IUser>[] = [
    {
      field: 'name',
      header: 'User',
      body: nameBodyTemplate,
      className: 'min-w-64'
    },
    {
      field: 'username',
      header: 'Username',
      body: usernameBodyTemplate,
      className: 'min-w-32'
    },
    {
      field: 'role',
      header: 'Role',
      body: roleBodyTemplate,
      className: 'min-w-24'
    },
    {
      field: 'isActive',
      header: 'Status',
      body: statusBodyTemplate,
      className: 'min-w-24'
    },
    {
      field: 'createdAt',
      header: 'Created',
      body: dateBodyTemplate,
      className: 'min-w-32'
    },
    {
      field: 'updatedAt',
      header: 'Updated',
      body: updatedDateBodyTemplate,
      className: 'min-w-32'
    },
    {
      header: 'Actions',
      body: actionBodyTemplate,
      className: 'min-w-32',
    }
  ];

  return (
    <div className="">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        {canCreate(RESOURCES.USERS) && (
          <CustomButton
            variant="primary"
            icon="pi pi-plus"
            onClick={handleAdd}
          >
            Add User
          </CustomButton>
        )}
      </div>

      {/* Search Filter */}
      <div className="flex justify-end mb-4">
        <div className="w-96">
          <InputSearch
            id="user-search"
            value={searchTerm}
            onChange={setSearchTerm}
            onDebouncedChange={onDebouncedSearchChange}
            placeholder="Search users"
          />
        </div>
      </div>

      {/* Users Table */}
      <div>
        <DataTable
          data={users}
          columns={userColumns}
          loading={loading}
          totalRecords={totalRecords}
          first={first}
          rows={rowsPerPage}
          onPage={handlePageChange}
          lazy={true}
          emptyMessage={<EmptyListMessage icon="pi pi-users" text="No users found" />}
          tableWrapperHeight="42vh"
        />
      </div>

      {/* Add User Dialog */}
      <CustomDialog
        visible={showAddDialog}
        onHide={handleDialogClose}
        header="Add New User"
        className="w-full max-w-md"
      >
        <UserForm
          onSubmit={handleAddSubmit}
          onCancel={handleDialogClose}
          loading={formLoading}
        />
      </CustomDialog>

      {/* Edit User Dialog */}
      <CustomDialog
        visible={!!editingUser}
        onHide={handleDialogClose}
        header="Edit User"
        className="w-full max-w-md"
      >
        <UserForm
          initialData={editingUser || undefined}
          onSubmit={handleEditSubmit}
          onCancel={handleDialogClose}
          loading={formLoading}
        />
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        visible={!!userToDelete}
        onCancel={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        name={userToDelete?.name ?? ''}
      />
    </div>
  );
}; 