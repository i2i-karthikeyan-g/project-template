
## Project Structure Guidelines

### Folder Structure
Follow the established project structure:

```
src/
├── assets/                    # Static assets (images, fonts)
│   ├── fonts/
│   └── images/
├── components/                # Reusable UI components
│   ├── uielements/           # Basic UI elements (Input, Button, etc.)
│   ├── routing/              # Route protection components
│   
├── constants/                 # Application constants
├── context/                   # React Context providers
│   └── auth/                 # Authentication context
├── features/                  # Feature-based modules
│   ├── auth/                 # Authentication
│   └── users/                # User management
├── hooks/                     # Custom React hooks
├── layouts/                   # Layout components
├── pages/                     # Page components
├── services/                  # API services
│   └── api/                  # API configuration and utilities
├── storage/                   # Local storage utilities
├── styles/                    # Global styles
├── types/                     # Global type definitions
└── utils/                     # Utility functions
```

### File Naming Conventions

#### Service Files (.service.ts)
- Use kebab-case: `account.service.ts`, `user.service.ts`
- Always prefix API methods with `process`:
  - `processGetAll[Entity]`
  - `processGet[Entity]ById`
  - `processCreate[Entity]`
  - `processUpdate[Entity]`
  - `processDelete[Entity]`

Example:
```typescript
// account.service.ts
export const processGetAllAccounts = async (params: IGetAccountsParams): Promise<ApiResponse<IGetAllAccountsResponse>> => {
  return await api({ method: 'GET', url: '/accounts', data: params });
};

export const processCreateAccount = async (formData: IAccountForm): Promise<ApiResponse<IAccounts>> => {
  return await api({ method: 'POST', url: '/accounts', data: formData });
};
```

#### Type Files (.types.ts)
- Use kebab-case: `account.types.ts`, `user.types.ts`
- Define interfaces with `I` prefix for forms and entities
- Use descriptive names for response types

Example:
```typescript
// account.types.ts
export interface IAccountForm {
  name: string;
  website?: string;
  representatives: IRepresentativeForm[];
}

export interface IAccounts extends IAccountForm {
  id: number;
  created_at: string;
}

export interface IGetAllAccountsResponse {
  clients: IAccounts[];
  total: number;
  page: number;
}
```

#### Constants Files (.constants.ts)
- Use kebab-case: `routePaths.constants.ts`, `permissions.constants.ts`
- Use UPPER_SNAKE_CASE for constant values
- Export as const objects

Example:
```typescript
// routePaths.constants.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ACCOUNTS: '/accounts',
  ACCOUNTS_ADD: '/accounts/add',
  ACCOUNTS_EDIT: '/accounts/edit/:id',
  ACCOUNTS_VIEW: '/accounts/view/:id',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
```

### Feature Module Structure

Each feature should follow this structure:

```
features/[feature-name]/
├── components/               # Feature-specific components
├── [feature].service.ts      # API service methods
├── [feature].types.ts        # Type definitions
├── [feature].constants.ts    # Feature constants (if needed)
├── [feature].utils.ts        # Feature utilities (if needed)
├── [Feature]ListScreen.tsx   # List/table screen
├── Add[Feature]Screen.tsx    # Add/create screen
├── Edit[Feature]Screen.tsx   # Edit screen
└── View[Feature]Screen.tsx   # View/details screen
```

### Component Structure Guidelines

#### Screen Components
- Use PascalCase: `AccountsListScreen.tsx`
- Follow the strict component order:
  1. Imports (React, external, internal, types)
  2. Types/Interfaces
  3. Component definition
  4. Hooks (useState, useEffect, custom hooks)
  5. Calculations/Derived values
  6. Event handlers
  7. API call functions (GET, CREATE, UPDATE, DELETE order)
  8. JSX return

Example:
```typescript
// AccountsListScreen.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { processGetAllAccounts, processDeleteAccount } from './account.service';
import { IAccounts, IAccountForm } from './account.types';

export const AccountsListScreen = () => {
  // 1. Hooks
  const [accounts, setAccounts] = useState<IAccounts[]>([]);
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useToast();
  const navigate = useNavigate();

  // 2. Calculations
  const totalRecords = accounts.length;

  // 3. Event handlers
  const handleAddAccount = () => navigate('/accounts/add');
  const handleEdit = (account: IAccounts) => navigate(`/accounts/edit/${account.id}`);

  // 4. API calls
  const getAllAccounts = async (params: { page: number; limit: number; search?: string }) => {
    setLoading(true);
    try {
      const response = await processGetAllAccounts(params);
      setAccounts(response.data.clients);
    } catch (error: any) {
      showErrorToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. JSX return
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

#### Form Components
- Use PascalCase: `AccountForm.tsx`
- Accept props: `initialData`, `onSubmit`, `onCancel`, `loading`
- Use React Hook Form for form management
- Include proper validation

Example:
```typescript
// AccountForm.tsx
import { useForm } from 'react-hook-form';
import { IAccountForm, IAccounts } from './account.types';

export interface IAccountFormProps {
  initialData?: IAccounts;
  onSubmit: (data: IAccountForm) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const AccountForm = ({ initialData, onSubmit, onCancel, loading = false }: IAccountFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<IAccountForm>({
    defaultValues: initialData || { name: '', website: '', representatives: [] }
  });

  const onFormSubmit = (data: IAccountForm) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

### Authentication & Permissions

#### Auth Context Structure
- Use `AuthContext.tsx` for authentication state management
- Include user data, authentication status, and permission methods
- Provide logout and refresh user functionality

Example:
```typescript
// AuthContext.tsx
export interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
  canAccessResource: (resource: Resource, action: Action) => boolean;
  canView: (resource: Resource) => boolean;
  canCreate: (resource: Resource) => boolean;
  canUpdate: (resource: Resource) => boolean;
  canDelete: (resource: Resource) => boolean;
}
```

#### Permission Constants
- Define resources and actions as constants
- Use UPPER_SNAKE_CASE for permission names

Example:
```typescript
// permissions.constants.ts
export const RESOURCES = {
  ACCOUNTS: 'accounts',
  USERS: 'users',
  PROFILE: 'profile',
} as const;

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
} as const;
```

### Routing Guidelines

#### Route Protection
- Use `ResourceProtectedRoute` for protected routes
- Use `PublicRoute` for public routes (login, signup)
- Define routes in `App.tsx` with proper nesting

Example:
```typescript
// App.tsx
<Route
  path={ROUTES.ACCOUNTS}
  element={
    <ResourceProtectedRoute resource={RESOURCES.ACCOUNTS}>
      <AccountsListPage />
    </ResourceProtectedRoute>
  }
/>

<Route
  path={ROUTES.ACCOUNTS_ADD}
  element={
    <ResourceProtectedRoute resource={RESOURCES.ACCOUNTS} action={ACTIONS.CREATE}>
      <AddAccountPage />
    </ResourceProtectedRoute>
  }
/>
```

#### Route Constants
- Define all routes in `routePaths.constants.ts`
- Use descriptive names for route parameters
- Group routes by feature

Example:
```typescript
// routePaths.constants.ts
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  SIGNUP: '/signup',
  
  // Protected routes
  HOME: '/',
  CLIENTS: '/clients',
  CLIENTS_ADD: '/clients/add',
  CLIENTS_EDIT: '/clients/edit/:id',
  CLIENTS_VIEW: '/clients/view/:id',
  
  // Other features...
  USERS: '/users',
  PROFILE: '/profile',
  
  // Utility routes
  NOT_FOUND: '*',
} as const;
```

### Custom Hooks Guidelines

#### Hook Naming
- Use `use` prefix: `useDebounce.ts`
- Use camelCase for hook names
- Export both the hook and utility functions if needed

Example:
```typescript
// useDebounce.ts
export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T => {
  // Hook implementation
};

export const useDebounceState = <T>(value: T, delay: number = 500): T => {
  // Hook implementation
};
```

### Utility Functions Guidelines

#### Utility File Structure
- Use kebab-case: `dateTimeUtils.ts`, `functions.ts`
- Export utility functions individually
- Include proper TypeScript types

Example:
```typescript
// dateTimeUtils.ts
export class DateTimeUtils {
  static format(date: Date | string | number | undefined, pattern: string): string {
    // Implementation
  }
}

// functions.ts
export const copyToClipboardText = async (text: string): Promise<boolean> => {
  // Implementation
};

export const getNameInitials = (name: string): string => {
  // Implementation
};
```

### API Service Guidelines

#### Service Method Structure
- Always use `process` prefix for API methods
- Include proper TypeScript interfaces for parameters and responses
- Handle errors consistently
- Use the centralized `api` function from `services/api/apiService.ts`

Example:
```typescript
// account.service.ts
export const processGetAllAccounts = async (
  params: IGetAccountsParams = {}
): Promise<ApiResponse<IGetAllAccountsResponse>> => {
  return await api({ 
    method: 'GET', 
    url: '/accounts', 
    data: params 
  });
};

export const processCreateAccount = async (
  formData: IAccountForm
): Promise<ApiResponse<IAccounts>> => {
  return await api({ 
    method: 'POST', 
    url: '/accounts', 
    data: formData 
  });
};
```

### UI Elements Guidelines

#### Component Props
- Use consistent prop interfaces
- Include proper TypeScript types
- Provide default values where appropriate
- Use proper event handlers

Example:
```typescript
// Input.tsx
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  id?: string;
  type?: string;
}
```

### Data Table Guidelines

#### Table Configuration
- Use the `DataTable` component from `uielements/datatable/DataTable.tsx`
- Define column configurations with proper types
- Include body templates for custom cell rendering
- Handle pagination and loading states

Example:
```typescript
const columns: ColumnConfig<IAccounts>[] = [
  {
    field: 'name',
    header: 'Name',
    body: nameBodyTemplate,
    sortable: true
  },
  {
    field: 'created_at',
    header: 'Created Date',
    body: dateBodyTemplate,
    sortable: true
  }
];
```

### Toast Notifications

#### Toast Usage
- Use the `useToast` hook from `ToastContext`
- Provide meaningful success and error messages
- Use consistent message formatting

Example:
```typescript
const { showSuccessToast, showErrorToast } = useToast();

// Success
showSuccessToast('Account created successfully');

// Error
showErrorToast('Failed to create account');
```

### Local Storage Guidelines

#### Storage Access
- Use the `LocalStorages` class from `storage/LocalStorages.ts`
- Don't use direct localStorage/sessionStorage access
- Use proper error handling

Example:
```typescript
import { LocalStorages } from '@/storage/LocalStorages';

// Get item
const token = LocalStorages.get('auth_token');

// Set item
LocalStorages.set('auth_token', token);

// Remove item
LocalStorages.remove('auth_token');
```

### Import Guidelines

#### Import Order
1. React imports
2. External library imports
3. Internal component imports
4. Service imports
5. Type imports
6. Style imports

Example:
```typescript
// React
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// External
import { Button } from 'primereact/button';

// Internal
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/uielements/Input';
import { processGetAllAccounts } from './account.service';

// Types
import { IAccounts } from './account.types';
```

### Error Handling Guidelines

#### API Error Handling
- Use try-catch blocks for all async operations
- Show user-friendly error messages via toast
- Handle loading states properly
- Provide fallback values for failed operations

Example:
```typescript
const getAllAccounts = async (params: { page: number; limit: number; search?: string }) => {
  setLoading(true);
  try {
    const response = await processGetAllAccounts(params);
    setAccounts(response.data.clients);
    setTotalRecords(response.data.total);
  } catch (error: any) {
    showErrorToast(error.message);
    setAccounts([]);
    setTotalRecords(0);
  } finally {
    setLoading(false);
  }
};
```

### Performance Guidelines

#### Component Optimization
- Use `React.memo` for expensive components
- Implement proper loading states
- Use `useMemo` for expensive calculations
- Use `useCallback` for function props passed to child components

Example:
```typescript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

const memoizedCallback = useCallback((id: string) => {
  handleItemClick(id);
}, [handleItemClick]);
```

### Testing Guidelines

#### Component Testing
- Test component rendering
- Test user interactions
- Test error states
- Test loading states
- Test form submissions
- Test API integrations

Example:
```typescript
describe('AccountsListScreen', () => {
  it('renders accounts list correctly', () => {
    render(<AccountsListScreen />);
    expect(screen.getByText('Accounts')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<AccountsListScreen />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows error message on API failure', async () => {
    // Test implementation
  });
});
```





