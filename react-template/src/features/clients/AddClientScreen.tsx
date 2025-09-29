import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '../../components/uielements/CustomButton';
import { ClientForm } from './components/ClientForm';
import { processCreateClient } from './client.service';
import { useToast } from '../../context/ToastContext';
import type { IClientForm } from './client.types';
import { ROUTES } from '../../constants/routePaths.constants';



export const AddClientScreen = () => {

  const navigate = useNavigate();

  const { showSuccessToast, showErrorToast } = useToast();

  const [loading, setLoading] = useState(false);


  const handleCancel = () => {
    navigate(ROUTES.CLIENTS);
  };


  const createClient = async (data: IClientForm) => {
    setLoading(true);
    try {
      const response = await processCreateClient(data);
      showSuccessToast(response?.message || 'Client created successfully');
      navigate(ROUTES.CLIENTS);
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="">
      <div className="flex items-center mb-4">
        <CustomButton
          variant="ghost"
          size="sm"
          icon="pi pi-arrow-left"
          onClick={handleCancel}
          className="mr-3"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Client</h1>
        </div>
      </div>


      <div>
        <ClientForm
          onSubmit={createClient}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};
