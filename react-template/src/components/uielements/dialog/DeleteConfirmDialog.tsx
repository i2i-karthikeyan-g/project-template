import React from 'react';
import { CustomDialog } from './CustomDialog';
import { CustomButton } from '../CustomButton';

interface DeleteConfirmDialogProps {
  visible: boolean;
  header?: string;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  visible,
  header = 'Confirm Delete',
  name,
  onCancel,
  onConfirm
}) => {
  return (
    <CustomDialog
      visible={visible}
      onHide={onCancel}
      header={header}
      width="50vw"
      breakpoints={{ '960px': '75vw', '641px': '95vw' }}
    >
      <div className="w-full flex items-center gap-3 mb-4">
        <div>
          <p className="text-gray-900 font-medium">
            Are you sure you want to delete "{name}"?
          </p>
          <p className="text-gray-600 text-sm mt-1">
            This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <CustomButton
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </CustomButton>
        <CustomButton
          variant="danger"
          onClick={onConfirm}
        >
          Delete
        </CustomButton>
      </div>
    </CustomDialog>
  );
};

export default DeleteConfirmDialog; 