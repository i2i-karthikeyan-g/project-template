import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CustomButton } from '../../components/uielements/CustomButton';
import { Loading } from '../../components/uielements/Loading';
import { processGetClientById } from './client.service';
import { useToast } from '../../context/ToastContext';
import type { IClient } from './client.types';
import { copyToClipboardText, getNameInitials } from '../../utils/functions';
import { DatetimeUtils, DATE_FORMAT } from '../../utils/dateTimeUtils';
import { useAuthContext } from '../../context/auth/AuthContext';
import { RESOURCES } from '../../context/auth/permissions.constants';


export const ViewClientScreen = () => {

  const [client, setClient] = useState<IClient | null>(null);
  const [loading, setLoading] = useState(true);
  const { showErrorToast } = useToast();
  const { canView } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();


  const handleBack = () => {
    navigate(-1);
  };

  const copyToClipboard = async (text: string) => {
    return copyToClipboardText(text);
  };



  // 4. API Call Functions
  const getClient = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await processGetClientById(id);
      setClient(response?.data.client || null);
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to fetch client');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClient();
  }, [id]);

  if (loading) {
    return <Loading loading={loading} />;
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Client not found</p>
        <button
          onClick={handleBack}
          className="mt-4 text-primary-600 hover:text-primary-800"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center">
          <CustomButton
            variant="ghost"
            size="sm"
            icon="pi pi-arrow-left"
            onClick={handleBack}
            className="mr-4 p-2"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Client Details</h1>
          </div>
        </div>
      </div>

      {/* Enhanced Organization Overview Card - Comprehensive */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-8">
        <div className="flex flex-col gap-4">
          {/* Organization Avatar/Logo */}
          <div className="relative flex-shrink-0">
            {client.logoUrl ? (
              <img
                src={client.logoUrl}
                alt={`${client.name} logo`}
                className="h-10 w-auto max-w-32 object-contain rounded-sm"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {getNameInitials(client.name)}
                </span>
              </div>
            )}
          </div>

          {/* Organization Info */}
          <div className="flex-1 min-w-0 ">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 break-words">{client.name}</h2>

            {/* Key Metrics */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 sm:gap-6 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <i className="pi pi-building-columns text-primary-600" />
                <span className="text-sm font-medium">
                  {client.industry}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <i className="pi pi-map-marker text-primary-600" />
                <span className="text-sm font-medium">
                  {client.country}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <i className="pi pi-calendar-plus text-primary-600" />
                <span className="text-sm font-medium text-center sm:text-left">
                  Created {DatetimeUtils.format(client.createdAt, DATE_FORMAT.FULL_DATE_TIME)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <i className="pi pi-calendar-minus text-primary-600" />
                <span className="text-sm font-medium text-center sm:text-left">
                  Updated {DatetimeUtils.format(client.updatedAt, DATE_FORMAT.FULL_DATE_TIME)}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              {client.website && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    <i className="pi pi-globe text-gray-400 flex-shrink-0" />
                    <a
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 transition-colors duration-200 truncate"
                      title={client.website}
                    >
                      {client.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                      title="Visit website"
                    >
                      <i className="pi pi-external-link text-primary-600 text-sm" />
                    </a>
                    <button
                      onClick={() => copyToClipboard(client.website)}
                      className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      title="Copy website URL"
                    >
                      <i className="pi pi-copy text-gray-600 text-sm" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Contact Card - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <i className="pi pi-user text-primary-600 text-lg" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Primary Contact</h3>
        </div>

        <div className="max-w-2xl">
          <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Contact Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {getNameInitials(client.primaryContactName)}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex-1 min-w-0">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 truncate">{client.primaryContactName}</h4>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                      <i className="pi pi-envelope text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 truncate" title={client.primaryMailAddress}>{client.primaryMailAddress}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a
                        href={`mailto:${client.primaryMailAddress}`}
                        className="p-1.5 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                        title="Send email"
                      >
                        <i className="pi pi-send text-primary-600 text-sm" />
                      </a>
                      <button
                        onClick={() => copyToClipboard(client.primaryMailAddress)}
                        className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        title="Copy email"
                      >
                        <i className="pi pi-copy text-gray-400 text-sm" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                      <i className="pi pi-phone text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 truncate" title={client.number}>{client.number}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a
                        href={`tel:${client.number}`}
                        className="p-1.5 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Call"
                      >
                        <i className="pi pi-phone text-green-600 text-sm" />
                      </a>
                      <button
                        onClick={() => copyToClipboard(client.number)}
                        className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        title="Copy phone number"
                      >
                        <i className="pi pi-copy text-gray-400 text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
