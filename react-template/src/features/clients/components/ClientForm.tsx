import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Input } from '../../../components/uielements/Input';
import { CustomButton } from '../../../components/uielements/CustomButton';
import { MultiSelect } from '../../../components/uielements/MultiSelect';
import { ImageUpload } from '../../../components/uielements/ImageUpload';
import type { IClientForm, IClient } from '../client.types';
import type { SelectOption } from '../../../components/uielements/MultiSelect';

export interface IClientFormProps {
  initialData?: IClient;
  onSubmit: (data: IClientForm) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ClientForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: IClientFormProps) => {

  const isEditMode = !!initialData;


  const { control, handleSubmit } = useForm<IClientForm>({
    mode: 'onBlur',
    defaultValues: initialData ? {
      ...initialData,

      logo: undefined
    } : {
      name: '',
      industry: '',
      website: '',
      primaryContactName: '',
      primaryMailAddress: '',
      number: '',
      country: '',
      user: {
        name: '',
        email: ''
      },
      logo: undefined
    }
  });



  const onFormSubmit = (data: IClientForm) => {
    onSubmit(data);
  };



  const clientValidationRules = {
    name: {
      required: 'Client name is required',
      minLength: {
        value: 2,
        message: 'Client name must be at least 2 characters'
      }
    },
    industry: {
      required: 'Industry is required'
    },
    primaryContactName: {
      required: 'Primary contact name is required'
    },
    primaryMailAddress: {
      required: 'Primary mail address is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address'
      }
    },
    website: {
      required: 'Website is required',
      pattern: {
        value: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/,
        message: 'Please enter a valid website URL (e.g., https://example.com)'
      }
    },
    number: {
      required: 'Phone number is required',
      validate: (value: string) => {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(value)) {
          return 'Phone number must be exactly 10 digits';
        }
        return true;
      }
    },
    country: {
      required: 'Country is required'
    }
  };

  // User validation rules
  const userValidationRules = {
    name: {
      required: 'User name is required',
      minLength: {
        value: 2,
        message: 'Name must be at least 2 characters'
      },
      pattern: {
        value: /^[a-zA-Z\s]+$/,
        message: 'Name can only contain letters and spaces'
      }
    },
    email: {
      required: 'User email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address'
      }
    }
  };



  return (
    <div>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">


        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <i className="pi pi-building-columns text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
                <p className="text-sm text-gray-600">Enter client details and contact information</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="lg:col-span-2">
              <Controller
                name="name"
                control={control}
                rules={clientValidationRules.name}
                render={({ field, fieldState }) => (
                  <Input
                    id="name"
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    label="Client Name *"
                    placeholder="Enter client name"
                    error={fieldState.error?.message}
                    disabled={loading}
                  />
                )}
              />
            </div>

            {/* Organization Logo */}
            <div className="lg:col-span-1">
              <Controller
                name="logo"
                control={control}
                rules={!isEditMode ? {
                  required: 'Client logo is required'
                } : {}}
                render={({ field, fieldState }) => (
                  <ImageUpload
                    id="logo"
                    value={field.value || null}
                    imageUrl={initialData?.logoUrl}
                    onChange={field.onChange}
                    label={`Client Logo *`}
                    error={fieldState.error?.message}
                    disabled={loading}
                    helpText="PNG or JPG format"
                    size="lg"
                    shape="square"
                  />
                )}
              />
            </div>

            <Controller
              name="industry"
              control={control}
              rules={clientValidationRules.industry}
              render={({ field, fieldState }) => (
                <Input
                  id="industry"
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Industry *"
                  placeholder="Enter industry"
                  error={fieldState.error?.message}
                  disabled={loading}
                />
              )}
            />


            <Controller
              name="country"
              control={control}
              rules={clientValidationRules.country}
              render={({ field, fieldState }) => (
                <Input
                  id="country"
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Country *"
                  placeholder="Enter country"
                  error={fieldState.error?.message}
                  disabled={loading}
                />
              )}
            />

            <Controller
              name="website"
              control={control}
              rules={clientValidationRules.website}
              render={({ field, fieldState }) => (
                <Input
                  id="website"
                  type="url"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Website *"
                  placeholder="https://example.com"
                  error={fieldState.error?.message}
                  disabled={loading}
                />
              )}
            />

            <Controller
              name="primaryContactName"
              control={control}
              rules={clientValidationRules.primaryContactName}
              render={({ field, fieldState }) => (
                <Input
                  id="primaryContactName"
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Primary Contact Name *"
                  placeholder="Enter contact name"
                  error={fieldState.error?.message}
                  disabled={loading}
                />
              )}
            />

            <Controller
              name="primaryMailAddress"
              control={control}
              rules={clientValidationRules.primaryMailAddress}
              render={({ field, fieldState }) => (
                <Input
                  id="primaryMailAddress"
                  type="email"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Primary Mail Address *"
                  placeholder="contact@example.com"
                  error={fieldState.error?.message}
                  disabled={loading}
                />
              )}
            />


            <Controller
              name="number"
              control={control}
              rules={clientValidationRules.number}
              render={({ field, fieldState }) => (
                <Input
                  id="number"
                  type="tel"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Phone Number *"
                  placeholder="9876543210"
                  error={fieldState.error?.message}
                  disabled={loading}
                />
              )}
            />
          </div>
        </div>

        {/* User Details Section - Only show during creation */}
        {!isEditMode && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <i className="pi pi-user text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
                  <p className="text-sm text-gray-600">Admin user for this client</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Name */}
              <Controller
                name="user.name"
                control={control}
                rules={userValidationRules.name}
                render={({ field, fieldState }) => (
                  <Input
                    id="userName"
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    label="User Name *"
                    placeholder="Enter user full name"
                    error={fieldState.error?.message}
                    disabled={loading}
                  />
                )}
              />

              {/* User Email */}
              <Controller
                name="user.email"
                control={control}
                rules={userValidationRules.email}
                render={({ field, fieldState }) => (
                  <Input
                    id="userEmail"
                    type="email"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    label="User Email *"
                    placeholder="user@example.com"
                    error={fieldState.error?.message}
                    disabled={loading}
                  />
                )}
              />


            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <CustomButton
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {isEditMode ? 'Update Client' : 'Create Client & User'}
            </CustomButton>
          </div>
        </div>
      </form>
    </div>
  );
};
