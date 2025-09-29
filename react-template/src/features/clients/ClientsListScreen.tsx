import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteConfirmDialog } from '../../components/uielements/dialog/DeleteConfirmDialog';
import { CustomButton } from '../../components/uielements/CustomButton';
import { InputSearch } from '../../components/uielements/InputSearch';
import { DataTable, useDataTablePagination, type ColumnConfig } from '../../components/uielements/datatable/DataTable';
import { EmptyListMessage } from '../../components/uielements/EmptyListMessage';
import { processGetAllClients, processDeleteClient } from './client.service';
import { useToast } from '../../context/ToastContext';
import { PROTECTED_ROUTES } from '../../constants/routePaths.constants';
import type { IClient, IGetClientsParams } from './client.types';
import { useAuthContext } from '../../context/auth/AuthContext';
import { RESOURCES } from '../../context/auth/permissions.constants';
import { DATE_FORMAT, DatetimeUtils } from '../../utils/dateTimeUtils';


export const ClientsListScreen = () => {

    const navigate = useNavigate();

    const { showSuccessToast, showErrorToast } = useToast();
    const { canCreate, canUpdate, canDelete } = useAuthContext();

    const { currentPage, rowsPerPage, first, totalRecords,
        handlePageChange, setTotalRecords } = useDataTablePagination();

    const [clients, setClients] = useState<IClient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [clientToDelete, setClientToDelete] = useState<IClient | null>(null);
    const [loading, setLoading] = useState(false);



    useEffect(() => {
        getAllClients({ page: currentPage, limit: rowsPerPage, search: searchTerm });
    }, [currentPage, rowsPerPage]);



    const handleView = (client: IClient) => {
        navigate(PROTECTED_ROUTES.CLIENTS_VIEW.replace(':id', client.id.toString()));
    };

    const handleEdit = (client: IClient) => {
        navigate(PROTECTED_ROUTES.CLIENTS_EDIT.replace(':id', client.id.toString()));
    };

    const handleDelete = (client: IClient) => {
        setClientToDelete(client);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;
        await deleteClient(clientToDelete);
    };

    const handleAddClient = () => {
        navigate(PROTECTED_ROUTES.CLIENTS_ADD);
    };

    const onDebouncedSearchChange = (value: string) => {
        getAllClients({ page: currentPage, limit: rowsPerPage, search: value });
    };



    const getAllClients = async (params: IGetClientsParams) => {
        setLoading(true);
        try {
            const response = await processGetAllClients(params);
            setClients(response?.data?.clients || []);
            setTotalRecords(response?.data?.total || 0);
        } catch (error: any) {
            showErrorToast(error?.message);
            setClients([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const deleteClient = async (client: IClient) => {
        try {
            const response = await processDeleteClient(client.id.toString());
            showSuccessToast(response?.message);
            getAllClients({ page: currentPage, limit: rowsPerPage, search: searchTerm });
        } catch (error: any) {
            showErrorToast(error?.message);
        } finally {
            setClientToDelete(null);
        }
    };

    const clientColumns: ColumnConfig<IClient>[] = [
        {
            header: 'Logo',
            body: (client: IClient) => (
                <div className="flex justify-center">
                    <button onClick={() => handleView(client)}>
                        {client.logoUrl ? (
                            <img
                                src={client.logoUrl}
                                alt={`${client.name} logo`}
                                className="h-10 w-auto max-w-32 object-contain rounded-sm cursor-pointer hover:opacity-80 transition-opacity duration-200"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary-200 transition-colors duration-200">
                                <i className="pi pi-building-columns text-primary-600 text-lg" />
                            </div>
                        )}
                    </button>
                </div>
            ),
            className: 'w-20 min-w-20'
        },
        {
            field: 'name',
            header: 'Organization',
            body: (client: IClient) => (
                <button className="text-left" onClick={() => handleView(client)}>
                    <div className="font-medium text-gray-900 truncate max-w-xs">{client.name}</div>
                    {client.website && (
                        <div className="text-sm text-gray-500 truncate max-w-xs" title={client.website}>
                            {client.website}
                        </div>
                    )}
                </button>
            ),
            className: 'min-w-48'
        },
        {
            header: 'Primary Contact',
            body: (client: IClient) => (
                <div>
                    <div className="font-medium text-gray-900">{client.primaryContactName}</div>
                    <div className="text-sm text-gray-500">{client.primaryMailAddress}</div>
                    <div className="text-sm text-gray-500">{client.number}</div>
                </div>
            ),
            className: 'min-w-48'
        },
        {
            header: 'Industry',
            body: (client: IClient) => (
                <span className="text-gray-700 text-sm">{client.industry}</span>
            ),
            className: 'min-w-32'
        },
        {
            header: 'Country',
            body: (client: IClient) => (
                <span className="text-gray-700 text-sm">{client.country}</span>
            ),
            className: 'min-w-32'
        },

        {
            header: 'Created At',
            body: (client: IClient) => (
                <div className="text-sm text-gray-600">{DatetimeUtils.format(client.createdAt, DATE_FORMAT.FULL_DATE_TIME)}</div>
            ),
            className: 'w-32 min-w-32'
        },
        {
            header: 'Updated At',
            body: (client: IClient) => (
                <div className="text-sm text-gray-600">{DatetimeUtils.format(client.updatedAt, DATE_FORMAT.FULL_DATE_TIME)}</div>
            ),
            className: 'w-32 min-w-32'
        },

        {
            header: 'Actions',
            body: (client: IClient) => (
                <div className="flex items-center gap-2">
                    <CustomButton
                        variant="ghost"
                        size="sm"
                        icon="pi pi-eye text-primary-600"
                        onClick={() => handleView(client)}
                        title="View"
                    />
                    {canUpdate(RESOURCES.CLIENTS) && (
                        <CustomButton
                            variant="ghost"
                            size="sm"
                            icon="pi pi-pencil text-primary-600"
                            onClick={() => handleEdit(client)}
                            title="Edit"
                        />
                    )}
                    {canDelete(RESOURCES.CLIENTS) && (
                        <CustomButton
                            variant="ghost"
                            size="sm"
                            icon="pi pi-trash text-red-600"
                            onClick={() => handleDelete(client)}
                            title="Delete"
                        />
                    )}
                </div>
            ),
            className: 'min-w-40',
        }
    ];


    return (
        <div className="">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                    <p className="text-gray-600">Manage your business clients and contacts</p>
                </div>
                {canCreate(RESOURCES.CLIENTS) && (
                    <CustomButton
                        variant="primary"
                        icon="pi pi-plus"
                        onClick={handleAddClient}
                    >
                        Add Client
                    </CustomButton>
                )}
            </div>

            {/* Search Filter */}
            <div className="flex justify-end mb-4">
                <div className="w-96">
                    <InputSearch
                        id="organization-search"
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onDebouncedChange={onDebouncedSearchChange}
                        placeholder="Search clients"
                    />
                </div>
            </div>

            <div>
                {/* DataTable with Server-side Pagination */}
                <DataTable
                    data={clients}
                    columns={clientColumns}
                    loading={loading}
                    totalRecords={totalRecords}
                    first={first}
                    rows={rowsPerPage}
                    onPage={handlePageChange}
                    lazy={true}
                    emptyMessage={
                        <EmptyListMessage
                            icon="pi pi-building-columns"
                            text={"No clients found"}
                        />
                    }
                    tableWrapperHeight="40vh"
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                visible={!!clientToDelete}
                onCancel={() => setClientToDelete(null)}
                onConfirm={confirmDelete}
                name={clientToDelete?.name || ''}
            />
        </div>
    );
};
