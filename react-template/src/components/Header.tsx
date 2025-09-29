import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import type { MenuItem } from 'primereact/menuitem';
import { useAuthContext } from '../context/auth/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROUTES, PROTECTED_ROUTES } from '../constants/routePaths.constants';


interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { showSuccessToast, showErrorToast } = useToast();

  const menuRef = useRef<Menu>(null);


  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
      showSuccessToast('You have been successfully logged out.');
    } catch (error) {
      showErrorToast('An error occurred while logging out.');
    }
  };

  const userMenuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => navigate(PROTECTED_ROUTES.PROFILE),
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: handleLogout,
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-200  flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Mobile toggle + Logo (mobile only) */}
        <div className="flex items-center">
          <Button
            icon="pi pi-bars"
            className="p-button-text p-button-sm mr-3 md:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          />
        </div>

        {/* Right side - User menu or auth buttons */}
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, {user.name}
              </span>
              <Avatar
                label={user.name?.charAt(0)?.toUpperCase()}
                className="bg-primary-500 text-white cursor-pointer hover:bg-primary-600 transition-colors"
                shape="circle"
                onClick={(e) => menuRef.current?.toggle(e)}
              />
              <Menu
                model={userMenuItems}
                popup
                ref={menuRef}
                className="mt-2"
              />
            </div>
          ) : null
          }
        </div>
      </div>
    </header>
  );
}; 