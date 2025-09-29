# React and TypeScript Coding Style Guide

## Component Structure
Components should follow this strict order:

1. Imports
2. Types/Interfaces
3. Component Definition
4. Hooks
5. Effects
6. Calculations/Derived Values
7. Event Handlers
9. Api Calls
8. Return JSX


## Naming Conventions

### Files
- Use kebab-case for file names
- Component files: `UserProfile.tsx`
- Utility files: `formatDate.ts`
- Type files: `user.types.ts`

### Components
- Use PascalCase for component names
- Use descriptive, noun-based names
- Prefix with feature name if needed: `UserProfile`, `OrderList`

### Functions
- Use camelCase
- Start with verb for actions: `handleSubmit`, `fetchData`
- Start with 'is'/'has' for booleans: `isLoading`, `hasError`

### Constants
- Use UPPER_SNAKE_CASE
- Group related constants in objects
- Export as const: `export const API_ENDPOINTS = { ... } as const;`

## API Service
- API Method names should always start with processGet, processCreate, processUpdate, processDelete

## TypeScript Best Practices

### Types and Interfaces
- Use interfaces for object shapes
- Use types for unions/intersections
- Avoid using `any`
- Use explicit return types for functions
- Use type guards for runtime checks

Example:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

type UserRole = 'admin' | 'user' | 'guest';

const isAdmin = (user: User): boolean => {
  return user.role === 'admin';
};
```

### Props
- Define prop interfaces
- Use required/optional props appropriately
- Document complex props
- Use proper event types

Example:
```typescript
interface ButtonProps {
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}
```

## React Best Practices

### Hooks
- Call hooks at the top level only
- Use proper dependency arrays
- Clean up effects
- Create custom hooks for reusable logic

Example:
```typescript
const useUserData = (userId: string) => {
  const [data, setData] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getUser(userId);
        setData(response);
      } catch (err) {
        setError(err as Error);
      }
    };

    fetchData();
  }, [userId]);

  return { data, error };
};
```

### State Management
- Use local state for component-specific data
- Use context for global state
- Keep state as close as possible to where it's used
- Use proper state types

### Error Handling
- Implement error boundaries
- Use try-catch for async operations
- Provide meaningful error messages
- Handle loading states

### Performance
- Use React.memo for expensive renders
- Use useMemo for expensive calculations
- Use useCallback for function props
- Implement proper loading states

## Styling Guidelines

### Tailwind CSS
- Use Tailwind classes for styling
- Follow mobile-first approach
- Use consistent spacing scale
- Use semantic color tokens

Example:
```typescript
<div className="flex items-center justify-between p-4 bg-white shadow-sm rounded-lg">
  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
  <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
    {buttonText}
  </button>
</div>
```

## Code Organization

### File Structure
- One component per file
- Co-locate related files
- Group by feature

### Imports
- Group imports by type
- Use absolute imports
- Remove unused imports
- Order: React, external, internal, types, styles

Example:
```typescript
// React
import { useState, useEffect } from 'react';

// External
import { format } from 'date-fns';

// Internal
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

// Types
import type { User } from '@/types/user';

// Styles
import './styles.css';
```

## Testing Guidelines

### Component Tests
- Test component rendering
- Test user interactions
- Test error states
- Test loading states

Example:
```typescript
describe('UserProfile', () => {
  it('renders user information correctly', () => {
    const user = mockUser();
    render(<UserProfile user={user} />);
    expect(screen.getByText(user.name)).toBeInTheDocument();
  });

  it('handles error state', () => {
    render(<UserProfile user={null} />);
    expect(screen.getByText('User not found')).toBeInTheDocument();
  });
});
```

## Documentation

### Comments
- Document complex logic
- Explain non-obvious decisions
- Use JSDoc for functions
- Keep comments up to date

Example:
```typescript
/**
 * Formats a date string into a localized format
 * @param date - The date to format
 * @param format - The format to use (default: 'MM/dd/yyyy')
 * @returns Formatted date string
 */
const formatDate = (date: string, format = 'MM/dd/yyyy'): string => {
  return format(new Date(date), format);
};
```

## Git Commit Messages

Follow Conventional Commits:
- `feature:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting
- `refactor:` for refactoring
- `test:` for tests
- `chore:` for maintenance

Example: `feature: add user profile component with avatar upload`


