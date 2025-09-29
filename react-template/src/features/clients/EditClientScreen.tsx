import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CustomButton } from '../../components/uielements/CustomButton';
import { Loading } from '../../components/uielements/Loading';
import { ClientForm } from './components/ClientForm';
import { processGetClientById, processUpdateClient } from './client.service';
import { useToast } from '../../context/ToastContext';
import type { IClient, IClientForm } from './client.types';
import { ROUTES } from '../../constants/routePaths.constants';

export const EditClientScreen = () => {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const { showSuccessToast, showErrorToast } = useToast();

  const [client, setClient] = useState<IClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);



  useEffect(() => {
    getClient();
  }, [id]);


  const handleCancel = () => {
    navigate(ROUTES.CLIENTS);
  };


  const getClient = async () => {
    if (!id) return;

    setInitialLoading(true);
    try {
      const response = await processGetClientById(id);
      setClient(response?.data?.client || null);
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to fetch client');
      navigate(ROUTES.CLIENTS);
    } finally {
      setInitialLoading(false);
    }
  };

  const updateClient = async (data: IClientForm) => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await processUpdateClient(id, data);
      showSuccessToast(response?.message || 'Client updated successfully');
      navigate(ROUTES.CLIENTS);
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };



  if (initialLoading) {
    return (
      <Loading loading={initialLoading} />
    );
  }

  if (!client) {
    return null
  }

  return (
    <div className="">
      {/* Page Header */}
      <div className="flex items-center mb-4">
        <CustomButton
          variant="ghost"
          size="sm"
          icon="pi pi-arrow-left"
          onClick={handleCancel}
          className="mr-3"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Client</h1>
        </div>
      </div>

      <div>
        <ClientForm
          initialData={client}
          onSubmit={updateClient}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>

    </div>
  );
};
