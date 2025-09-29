import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/auth/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import { ClientsListPage } from './pages/clients/ClientsListPage';
import { AddClientPage } from './pages/clients/AddClientPage';
import { EditClientPage } from './pages/clients/EditClientPage';
import { ViewClientPage } from './pages/clients/ViewClientPage';
import { UsersListPage } from './pages/users/UsersListPage';
import ProfilePage from './pages/ProfilePage';
import { ResourceProtectedRoute } from './components/routing/ResourceProtectedRoute';
import { RESOURCES, ACTIONS } from './context/auth/permissions.constants';
import { ROUTES } from './constants/routePaths.constants';
import { PublicRoute } from './components/routing/PublicRoute';
import { ClientUsersListPage } from './pages/client-users/ClientUsersListPage';


// PrimeReact configuration
const primeReactConfig = {
  inputStyle: 'outlined' as const,
  locale: 'en',
};


function App() {
  return (
    <PrimeReactProvider value={primeReactConfig} >
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route
                  path={ROUTES.HOME}
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path={ROUTES.LOGIN}
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path={ROUTES.SIGNUP}
                  element={
                    <PublicRoute>
                      <SignupPage />
                    </PublicRoute>
                  }
                />

                {/* Protected Routes with Layout */}
                <Route
                  element={
                    // Layout is not needed for public routes
                    <MainLayout />
                  }
                >

                  {/* Client Routes */}
                  <Route
                    path={ROUTES.CLIENTS}
                    element={
                      <ResourceProtectedRoute resource={RESOURCES.CLIENTS}>
                        <ClientsListPage />
                      </ResourceProtectedRoute>
                    }
                  />

                  <Route
                    path={ROUTES.CLIENTS_ADD}
                    element={
                      <ResourceProtectedRoute resource={RESOURCES.CLIENTS} action={ACTIONS.CREATE}>
                        <AddClientPage />
                      </ResourceProtectedRoute>
                    }
                  />

                  <Route
                    path={ROUTES.CLIENTS_EDIT}
                    element={
                      <ResourceProtectedRoute resource={RESOURCES.CLIENTS} action={ACTIONS.UPDATE}>
                        <EditClientPage />
                      </ResourceProtectedRoute>
                    }
                  />

                  <Route
                    path={ROUTES.CLIENTS_VIEW}
                    element={
                      <ResourceProtectedRoute resource={RESOURCES.CLIENTS} action={ACTIONS.VIEW}>
                        <ViewClientPage />
                      </ResourceProtectedRoute>
                    }
                  />

                  {/* Users Route */}
                  <Route
                    path={ROUTES.USERS}
                    element={
                      <ResourceProtectedRoute resource={RESOURCES.USERS}>
                        <UsersListPage />
                      </ResourceProtectedRoute>
                    }
                  />
                  {/* Client Users Route */}
                  <Route
                    path={ROUTES.CLIENT_USERS}
                    element={
                      <ResourceProtectedRoute resource={RESOURCES.CLIENT_USERS}>
                        <ClientUsersListPage />
                      </ResourceProtectedRoute>
                    }
                  />

                  {/* Profile Route */}
                  <Route
                    path={ROUTES.PROFILE}
                    element={
                      <ResourceProtectedRoute resource={RESOURCES.PROFILE}>
                        <ProfilePage />
                      </ResourceProtectedRoute>
                    }
                  />

                </Route>

                {/* 404 Route */}
                <Route path={ROUTES.NOT_FOUND} element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1><p className="text-gray-600 mb-4">Page not found</p><a href={ROUTES.HOME} className="text-primary-600 hover:text-primary-700 font-medium">← Go Home</a></div></div>} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </PrimeReactProvider>
  );
}

export default App;
