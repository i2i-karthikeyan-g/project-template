import React from 'react';
import { Dialog } from 'primereact/dialog';
import type { DialogProps } from 'primereact/dialog';

interface CustomDialogProps extends Omit<DialogProps, 'visible' | 'onHide' | 'className'> {
  visible: boolean;
  onHide: () => void;
  header?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  breakpoints?: { [key: string]: string };
  className?: string;
  width?: string;
  height?: string;
  style?: React.CSSProperties;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({
  visible,
  onHide,
  header,
  children,
  footer,
  width = '60vw',
  breakpoints = { '1800px': '50vw', '1200px': '65vw', '960px': '75vw', '641px': '95vw' },
  className = '',
  height,
  style,
  ...props
}) => {
  const dialogClassName = [
    'bg-white rounded-lg shadow-xl border border-gray-200',
    className
  ].filter(Boolean).join(' ');

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={header}
      footer={footer}
      style={{ width: width, height: height, ...style }}
      breakpoints={breakpoints}

      className={dialogClassName}
      draggable={false}
      resizable={false}
      modal={true}
      {...props}
    >
      <div className="text-gray-700">
        {children}
      </div>
    </Dialog>
  );
};

export default CustomDialog; 