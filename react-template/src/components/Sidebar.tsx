import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useAuthContext } from '../context/auth/AuthContext';
import { RESOURCES, MENU_RESOURCES_BY_ROLE, USER_ROLES } from '../context/auth/permissions.constants';
import type { UserRole, Resource } from '../context/auth/permissions.types';
import { PROTECTED_ROUTES } from '../constants/routePaths.constants';
import logo from '../assets/images/logo512.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const Sidebar = ({ isOpen, onClose, isMobile }: SidebarProps) => {

  const navigate = useNavigate();
  const location = useLocation();

  const { canView, userRole } = useAuthContext();

  const isValidUserRole = (role: string | null): role is UserRole => {
    if (!role) return false;
    return (Object.values(USER_ROLES) as string[]).includes(role);
  };

  const allowedResources: ReadonlyArray<Resource> = isValidUserRole(userRole)
    ? (MENU_RESOURCES_BY_ROLE[userRole] as ReadonlyArray<Resource>)
    : [];

  const navigationItems = [

    {
      label: 'Clients',
      icon: 'pi pi-building-columns',
      path: PROTECTED_ROUTES.CLIENTS,
      resource: RESOURCES.CLIENTS,
      command: () => navigate(PROTECTED_ROUTES.CLIENTS),
    },

    {
      label: 'Users',
      icon: 'pi pi-user',
      path: PROTECTED_ROUTES.USERS,
      resource: RESOURCES.USERS,
      command: () => navigate(PROTECTED_ROUTES.USERS),
    },
    {
      label: 'Client Users',
      icon: 'pi pi-user',
      path: PROTECTED_ROUTES.CLIENT_USERS,
      resource: RESOURCES.CLIENT_USERS,
      command: () => navigate(PROTECTED_ROUTES.CLIENT_USERS),
    },
  ];

  // Helper function to check if a route is active
  const isRouteActive = (itemPath: string, currentPath: string): boolean => {
    // Exact match
    if (currentPath === itemPath) {
      return true;
    }

    // Prefix match with proper boundary check
    // Ensures we don't match /accounts-archive when checking /accounts
    if (currentPath.startsWith(itemPath)) {
      const nextChar = currentPath.charAt(itemPath.length);
      // Only consider it active if the next character is '/' or end of string
      return nextChar === '/' || nextChar === '';
    }

    return false;
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:z-auto
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <img src={logo} alt="Application name" className="w-50 h-10" />
        </div>
          <Button
            icon="pi pi-times"
            className="p-button-text p-button-sm md:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              if (item.resource && !allowedResources.includes(item.resource)) {
                return null;
              }
              if (item.resource && !canView(item.resource)) {
                return null;
              }

              const isActive = isRouteActive(item.path, location.pathname);
              return (
                <li key={item.path}>
                  <button
                    onClick={item.command}
                    className={`
                      w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200
                      ${isActive
                        ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                      }
                    `}
                  >
                    <i className={`${item.icon} mr-3 text-lg`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

      </aside>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onClose();
            }
          }}
        >
        </button>
      )}
    </>
  );
}; 