https://victorlillo.dev/blog/react-typescript-vite-component-library

# Architecture & Implementation Strategy: ui-ux UI Design System (PrimeReact Edition)

This document is the **single source of truth** for designing, building, documenting, and distributing the **ui-ux UI** design system. 

**Core Stack:** install all libray latest version
*   **Build Tool:** Vite (Library Mode)
*   **Framework:** React 19+ / TypeScript 5+(latest)
*   **Styling Engine:** Tailwind CSS v3.4.x (NOT v4)
*   **Component Primitives:** PrimeReact 10+ (Unstyled Mode) - *for complex components only*
*   **Design Tokens:** Native CSS Variables (No extra runtime libraries)
*   **Class Utilities:** clsx + tailwind-merge (for safe className handling)
*   **Documentation:** Storybook 8
*   **Package Manager:** NPM

---

## 1. Architectural Reasoning

### Why PrimeReact + Tailwind + CSS Variables?
*   **PrimeReact (Unstyled Mode):** We avoid "fighting" default library styles. PrimeReact handles the hard logic (accessibility, focus management, complex state like DataTables/Pickers) while providing an "Unstyled" mode that lets us inject our own Tailwind classes.
*   **CSS Variables (Tokens):** By defining tokens like `--color-primary-500` in CSS, they become universally available. If a non-React app needs them, they just import the CSS.
*   **Tailwind CSS:** Acts as the API to consume these tokens. We configure Tailwind to reference `var(--color-primary-500)` instead of hex codes. This allows runtime theming (light/dark/brand) just by changing a CSS class on the body.

### Why clsx + tailwind-merge?

This is **critical for a component library** where consumers pass `className` props.

**The Problem Without tailwind-merge:**
```tsx
// Your library's Button has padding
<button className="px-4 ...">

// Consumer wants to override
<Button className="px-8">  // More padding please!
```

In Tailwind, conflicting utilities (like `px-4` and `px-8`) are resolved by **CSS source order**, not className order. If `px-4` appears later in the generated CSS, the consumer's `px-8` is ignored. This causes frustrating, silent bugs.

**The Solution:**
```tsx
import { cn } from '../utils/cn';

// cn() merges classes AND resolves Tailwind conflicts correctly
<button className={cn('px-4', className)}>  // Consumer's px-8 wins!
```

**Why Both Libraries:**
| Library | Purpose | Size |
|---------|---------|------|
| `clsx` | Conditional class logic, handles `undefined`/`false`/`null` | ~1kb |
| `tailwind-merge` | Resolves Tailwind utility conflicts intelligently | ~4kb |

**Total cost: ~5kb gzipped.** This prevents thousands of hours of debugging for consumers.

### Why Separate CSS Files (Not Injected)?
*   **Consumer Control:** Consumers can import CSS selectively or customize load order.
*   **Caching:** Separate CSS files can be cached independently by browsers.
*   **SSR Friendly:** No FOUC (Flash of Unstyled Content) issues.
*   **Smaller JS Bundle:** Styles don't bloat JavaScript bundles.
*   **Consistency:** Matches existing ui-web-app SCSS pattern.

### Why Provider-Free Architecture?
*   **Minimal Setup:** Import component + CSS, use it immediately. No wrapper required.
*   **Independence:** Each component is self-contained and works standalone.
*   **Gradual Adoption:** Consumers can use one component without full library commitment.
*   **Flexibility:** Mix pure React components with PrimeReact-based ones freely.
*   **Tree-Shaking:** Only pull dependencies for components actually used.
*   **No Context Bugs:** Avoids React context-related issues and debugging complexity.

---

## 2. Component Classification

Components are classified into two categories based on complexity:

### 2.1 Pure React Components (No PrimeReact)
Simple components that don't need PrimeReact's complex logic. Built with pure React.

| Component | Rationale |
|-----------|-----------|
| Button | Simple click handler, no complex state |
| Card | Layout container only |
| Badge | Static display element |
| Spinner/Loader | CSS animation only |
| Avatar | Image display with fallback |
| Divider | Simple HR element |
| InputText | Native input with styling |
| Checkbox | Native checkbox with styling |
| RadioButton | Native radio with styling |
| Switch/Toggle | Simple boolean toggle |

### 2.2 PrimeReact-Based Components (Complex Logic)
Components that benefit from PrimeReact's accessibility, keyboard navigation, and complex state management.

| Component | Why PrimeReact? |
|-----------|-----------------|
| Calendar/DatePicker | Date parsing, locale, keyboard nav, popup positioning |
| DataTable | Sorting, filtering, pagination, virtual scroll, selection |
| Dropdown/Select | Keyboard nav, search, virtualization, portal |
| AutoComplete | Async search, debounce, suggestion rendering |
| MultiSelect | Multi-selection, chips, keyboard nav |
| Dialog/Modal | Focus trap, escape key, portal, backdrop |
| Toast | Queue management, auto-dismiss, stacking |
| Menu/ContextMenu | Keyboard nav, nested menus, positioning |
| TreeSelect | Tree structure, expand/collapse, selection |
| Editor | Rich text editing (if needed) |

**Key Principle:** Use PrimeReact only when the component requires complex accessibility or state management that would take significant effort to build correctly.

---

## 3. Directory Structure

We follow a **co-located component structure** where all related files live in the same folder. This minimizes touch points and improves discoverability.

```text
ui-ux/
├── .storybook/                    # Storybook configuration
│   ├── main.ts
│   └── preview.tsx
├── src/
│   ├── components/                # All UI components
│   │   ├── Button/                # Pure React component
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   ├── Button.scss
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts

│   │   └── index.ts               # Main barrel file for all components
│   ├── styles/                    # Global Design Tokens & Base Styles
│   │   ├── tokens/
│   │   │   ├── colors.css
│   │   │   ├── spacing.css
│   │   │   ├── typography.css
│   │   │   ├── shadows.css
│   │   │   ├── borders.css
│   │   │   └── z-index.css
│   │   ├── themes/
│   │   │   ├── light.css
│   │   │   └── dark.css
│   │   ├── base.css
│   │   └── index.css
│   ├── utils/                     # Utility functions
│   │   └── cn.ts                  # clsx + tailwind-merge utility
│   ├── hooks/                     # Custom hooks (if any)
│   ├── App.tsx                    # Dev playground (not exported)
│   ├── main.tsx                   # Dev entry (not exported)
│   └── index.ts                   # Library entry point (public API)
├── dist/                          # Build output (generated)
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Component Folder Convention
Each component folder contains **ALL** related files:

| File | Purpose |
|------|---------|
| `ComponentName.tsx` | Main component implementation |
| `ComponentName.types.ts` | TypeScript interfaces and types |
| `ComponentName.scss` | Component-specific styles |
| `ComponentName.config.ts` | Constants, default values, static data (optional) |
| `ComponentName.stories.tsx` | Storybook documentation |
| `index.ts` | Barrel export |

---

## 4. Design Tokens (Complete Token System)

### 4.1 Token File Structure

**styles/tokens/colors.css**
```css
:root {
  /* ========================================
     PRIMITIVE TOKENS (Raw Values)
     ======================================== */
  --p-blue-50: #eff6ff;
  --p-blue-100: #dbeafe;
  --p-blue-500: #3b82f6;
  --p-blue-600: #2563eb;
  --p-blue-700: #1d4ed8;
  
  --p-slate-50: #f8fafc;
  --p-slate-100: #f1f5f9;
  --p-slate-200: #e2e8f0;
  --p-slate-300: #cbd5e1;
  --p-slate-700: #334155;
  --p-slate-800: #1e293b;
  --p-slate-900: #0f172a;
  
  --p-red-500: #ef4444;
  --p-red-600: #dc2626;
  
  --p-green-500: #22c55e;
  --p-green-600: #16a34a;
  
  --p-amber-500: #f59e0b;
  
  --p-white: #ffffff;
  --p-black: #000000;

  /* ========================================
     SEMANTIC TOKENS (Purpose-Based)
     ======================================== */
  /* Brand Colors */
  --brand: var(--p-blue-600);
  --brand-hover: var(--p-blue-700);
  --brand-active: var(--p-blue-800);
  --brand-subtle: var(--p-blue-50);
  --brand-on: var(--p-white);
  
  /* Surface Colors */
  --surface-primary: var(--p-white);
  --surface-secondary: var(--p-slate-50);
  --surface-tertiary: var(--p-slate-100);
  --surface-border-default: var(--p-slate-200);
  --surface-border-strong: var(--p-slate-300);
  
  /* Content/Text Colors */
  --content-primary: var(--p-slate-900);
  --content-secondary: var(--p-slate-700);
  --content-tertiary: var(--p-slate-500);
  --content-disabled: var(--p-slate-400);
  --content-inverse: var(--p-white);
  
  /* Status Colors */
  --status-success: var(--p-green-500);
  --status-success-bg: #dcfce7;
  --status-error: var(--p-red-500);
  --status-error-bg: #fee2e2;
  --status-warning: var(--p-amber-500);
  --status-warning-bg: #fef3c7;
  --status-info: var(--p-blue-500);
  --status-info-bg: var(--p-blue-50);
}
```

**styles/tokens/spacing.css**
```css
:root {
  /* Spacing Scale (4px base) */
  --spacing-0: 0;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
}
```

**styles/tokens/typography.css**
```css
:root {
  /* Font Families */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Font Sizes */
  --font-size-xs: 12px;
  --font-size-small: 13px;
  --font-size-base: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 30px;
  
  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

**styles/tokens/shadows.css**
```css
:root {
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-default: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

**styles/tokens/borders.css**
```css
:root {
  /* Border Radius */
  --radius-none: 0;
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;
  
  /* Border Widths */
  --border-width-default: 1px;
  --border-width-2: 2px;
}
```

**styles/tokens/z-index.css**
```css
:root {
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;
}
```

### 4.2 Theme Files

**styles/themes/dark.css**
```css
[data-theme="dark"] {
  /* Surface overrides */
  --surface-primary: var(--p-slate-900);
  --surface-secondary: var(--p-slate-800);
  --surface-tertiary: var(--p-slate-700);
  --surface-border-default: var(--p-slate-700);
  --surface-border-strong: var(--p-slate-600);
  
  /* Content overrides */
  --content-primary: var(--p-white);
  --content-secondary: var(--p-slate-300);
  --content-tertiary: var(--p-slate-400);
  --content-disabled: var(--p-slate-500);
  
  /* Brand adjustments for dark mode */
  --brand-subtle: var(--p-slate-800);
}
```

### 4.3 Main Styles Entry

**styles/index.css**
```css
/* Base Reset & Defaults */
@import './base.css';

/* Design Tokens */
@import './tokens/colors.css';
@import './tokens/spacing.css';
@import './tokens/typography.css';
@import './tokens/shadows.css';
@import './tokens/borders.css';
@import './tokens/z-index.css';

/* Theme Overrides */
@import './themes/dark.css';

/* Tailwind Directives */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 5. Tailwind Configuration

**tailwind.config.ts**
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          DEFAULT: 'var(--brand)',
          hover: 'var(--brand-hover)',
          active: 'var(--brand-active)',
          subtle: 'var(--brand-subtle)',
          on: 'var(--brand-on)',
        },
        // Surface
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
          'border-default': 'var(--surface-border-default)',
          'border-strong': 'var(--surface-border-strong)',
        },
        // Content
        content: {
          primary: 'var(--content-primary)',
          secondary: 'var(--content-secondary)',
          tertiary: 'var(--content-tertiary)',
          disabled: 'var(--content-disabled)',
          inverse: 'var(--content-inverse)',
        },
        // Status
        status: {
          success: 'var(--status-success)',
          'success-bg': 'var(--status-success-bg)',
          error: 'var(--status-error)',
          'error-bg': 'var(--status-error-bg)',
          warning: 'var(--status-warning)',
          'warning-bg': 'var(--status-warning-bg)',
          info: 'var(--status-info)',
          'info-bg': 'var(--status-info-bg)',
        },
      },
      fontFamily: {
        primary: 'var(--font-family-primary)',
        mono: 'var(--font-family-mono)',
      },
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-small)',
        base: 'var(--font-size-base)',
        md: 'var(--font-size-md)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
      },
      spacing: {
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
        '16': 'var(--spacing-16)',
        '20': 'var(--spacing-20)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-default)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        fixed: 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
        toast: 'var(--z-toast)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 6. The `cn()` Utility (Critical for className Handling)

This utility combines `clsx` and `tailwind-merge` to safely handle className props.

**src/utils/cn.ts**
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines clsx and tailwind-merge for safe className handling.
 * 
 * - clsx: Handles conditional classes, arrays, and objects
 * - twMerge: Resolves Tailwind utility conflicts (e.g., px-4 vs px-8)
 * 
 * @example
 * cn('px-4', 'py-2', isActive && 'bg-blue-500', className)
 * cn('text-red-500', { 'font-bold': isBold }, className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### Why This Matters

**Without `cn()` (the problem):**
```tsx
// Library button has px-4
const Button = ({ className }) => (
  <button className={`px-4 py-2 ${className}`}>

// Consumer passes px-8
<Button className="px-8" />

// Result: BOTH px-4 AND px-8 are in the class string
// Which wins? Depends on CSS source order - UNPREDICTABLE!
```

**With `cn()` (the solution):**
```tsx
// Library button uses cn()
const Button = ({ className }) => (
  <button className={cn('px-4 py-2', className)}>

// Consumer passes px-8
<Button className="px-8" />

// Result: cn() removes px-4, keeps px-8 - CONSUMER WINS!
```

---

## 7. Component Architecture (Provider-Free)

All components work standalone without any provider wrapper. Import and use directly.

### 7.1 Pure React Component Pattern

For simple components that don't need PrimeReact.

**Example: src/components/Button/Button.tsx**
```tsx
import { cn } from '../../utils/cn';
import type { ButtonProps } from './Button.types';
import './Button.scss';

export const Button = ({ 
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  type = 'button',
  children,
  onClick,
  ...props 
}: ButtonProps) => {
  return (
    <button 
      type={type}
      className={cn(
        'ui-button',
        `ui-button--${variant}`,
        `ui-button--${size}`,
        disabled && 'ui-button--disabled',
        loading && 'ui-button--loading',
        className  // Consumer's classes always come last and can override
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="ui-button__spinner" />}
      {children}
    </button>
  );
};

export default Button;
```

**Example: src/components/Button/Button.types.ts**
```ts
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Button content */
  children?: ReactNode;
}
```

**Example: src/components/Button/Button.scss**
```scss
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
  
  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }

  // Variants
  &--primary {
    background: var(--brand);
    color: var(--brand-on);
    
    &:hover:not(.ui-button--disabled) {
      background: var(--brand-hover);
    }
    
    &:active:not(.ui-button--disabled) {
      background: var(--brand-active);
    }
  }

  &--secondary {
    background: var(--surface-secondary);
    color: var(--content-primary);
    border: var(--border-width-default) solid var(--surface-border-default);
    
    &:hover:not(.ui-button--disabled) {
      background: var(--surface-tertiary);
    }
  }

  &--outline {
    background: transparent;
    color: var(--brand);
    border: var(--border-width-default) solid var(--brand);
    
    &:hover:not(.ui-button--disabled) {
      background: var(--brand-subtle);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--content-primary);
    
    &:hover:not(.ui-button--disabled) {
      background: var(--surface-secondary);
    }
  }

  &--danger {
    background: var(--status-error);
    color: var(--content-inverse);
    
    &:hover:not(.ui-button--disabled) {
      background: var(--p-red-600);
    }
  }

  // Sizes
  &--sm {
    height: 32px;
    padding: 0 var(--spacing-3);
    font-size: var(--font-size-small);
    gap: var(--spacing-1);
  }

  &--md {
    height: 40px;
    padding: 0 var(--spacing-4);
    font-size: var(--font-size-base);
    gap: var(--spacing-2);
  }

  &--lg {
    height: 48px;
    padding: 0 var(--spacing-5);
    font-size: var(--font-size-md);
    gap: var(--spacing-2);
  }

  // States
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--loading {
    cursor: wait;
  }

  // Spinner
  &__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: ui-spin 0.6s linear infinite;
  }
}

@keyframes ui-spin {
  to { transform: rotate(360deg); }
}
```

**Example: src/components/Button/Button.stories.tsx**
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// Demonstrates className override capability
export const WithCustomClass: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button>Default</Button>
      <Button className="rounded-full">Rounded (override)</Button>
      <Button className="shadow-lg">With Shadow (add)</Button>
    </div>
  ),
};
```

**Example: src/components/Button/index.ts**
```ts
export { Button, default } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';
```

---

## 8. Storybook Configuration

### 8.1 Main Config

**.storybook/main.ts**
```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

### 8.2 Preview Config (No Provider Needed)

**.storybook/preview.tsx**
```tsx
import type { Preview } from '@storybook/react';
import 'primeicons/primeicons.css';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      // Simple wrapper with data-theme for dark mode testing
      // No provider needed!
      return (
        <div data-theme={theme} style={{ padding: '1rem' }}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
```

---

## 9. Build Configuration

### 9.1 Vite Library Mode

**vite.config.ts**
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
      exclude: ['src/App.tsx', 'src/main.tsx', '**/*.stories.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UI-UX',
      formats: ['es', 'cjs'],
      fileName: (format) => `ui-ux.${format}.js`,
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'primereact',
        /^primereact\/.*/,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        // Preserve CSS file structure
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'ui-ux.css';
          return assetInfo.name || 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Phase 1: Single CSS bundle (acceptable for MVP)
    // Phase 2 Tech Debt: Consider CSS splitting per component for better tree-shaking
    cssCodeSplit: false,
    sourcemap: true,
  },
});
```

### 9.2 TypeScript Configuration

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Library output */
    "declaration": true,
    "declarationMap": true,
    "declarationDir": "./dist/types",
    
    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.stories.tsx"]
}
```

### 9.3 Package.json Configuration

**package.json**
```json
{
  "name": "@ui-ux/ux",
  "version": "0.1.0",
  "type": "module",
  "description": "uiux UI Design System - React Component Library",
  "main": "./dist/ui-ux.cjs.js",
  "module": "./dist/ui-ux.es.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/ui-ux.es.js",
      "require": "./dist/ui-ux.cjs.js",
      "types": "./dist/types/index.d.ts"
    },
    "./styles": "./dist/ui-ux.css",
    "./styles.css": "./dist/ui-ux.css"
  },
  "files": [
    "dist"
  ],
  "sideEffects": [
    "**/*.css",
    "**/*.scss"
  ],
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "peerDependenciesMeta": {
    "primereact": {
      "optional": true
    }
  },
  "optionalDependencies": {
    "primereact": "^10.0.0"
  },
  "devDependencies": {
    "@storybook/addon-essentials": "^8.0.0",
    "@storybook/addon-interactions": "^8.0.0",
    "@storybook/addon-links": "^8.0.0",
    "@storybook/blocks": "^8.0.0",
    "@storybook/react": "^8.0.0",
    "@storybook/react-vite": "^8.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "primeicons": "^7.0.0",
    "primereact": "^10.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "sass": "^1.70.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vite-plugin-dts": "^3.7.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-org/ui-ux.git"
  },
  "keywords": [
    "react",
    "ui",
    "design-system",
    "components"
  ],
  "license": "MIT"
}
```

**Note:** 
- `clsx` and `tailwind-merge` are now **dependencies** (bundled with the library)
- PrimeReact remains `optionalDependencies` - consumers only need it for complex components

---

## 10. Consumer Usage Guide

### 10.1 Installation

```bash
# Install the package
npm install @ui-ux/ux

# PrimeReact is OPTIONAL - only install if using complex components
# (Calendar, DataTable, Dropdown, etc.)
npm install primereact primeicons
```

### 10.2 Import Styles (Required)

```tsx
// In your app's entry point (main.tsx or App.tsx)
import '@ui-ux/ux/styles.css';

// Only if using PrimeReact-based components
import 'primeicons/primeicons.css';
```

### 10.3 Use Components (Minimal Setup!)

**No provider needed.** Import and use directly:

```tsx
import { Button } from '@ui-ux/ux';

function MyComponent() {
  return (
    <Button variant="primary">Submit</Button>
  );
}
```

### 10.4 Override Styles Safely

Thanks to `tailwind-merge`, consumers can safely override any Tailwind utility:

```tsx
import { Button } from '@ui-ux/ux';

function MyComponent() {
  return (
    <>
      {/* Override padding */}
      <Button className="px-8 py-4">More Padding</Button>
      
      {/* Override border radius */}
      <Button className="rounded-full">Pill Button</Button>
      
      {/* Add new utilities */}
      <Button className="shadow-lg hover:shadow-xl">With Shadow</Button>
    </>
  );
}
```

### 10.5 Dark Mode (Simple Attribute)

Toggle dark mode by adding `data-theme="dark"` to any parent element:

```tsx
function App() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <div data-theme={isDark ? 'dark' : 'light'}>
      <Button onClick={() => setIsDark(!isDark)}>
        Toggle Theme
      </Button>
      {/* All children will use dark theme tokens */}
    </div>
  );
}
```

Or set it on `<html>` for app-wide theming:
```tsx
document.documentElement.setAttribute('data-theme', 'dark');
```

---

## 11. Distribution Strategy

### 11.1 Local Development (npm link / Yalc)

**Option A: npm link**
```bash
# In ui-ux
npm link

# In ui-web-app
npm link @ui-ux/ux
```

**Option B: Yalc (Recommended for Teams)**
```bash
# Install yalc globally
npm install -g yalc

# In ui-ux (after build)
yalc publish

# In ui-web-app
yalc add @ui-ux/ux
```

### 11.2 Private Registry (GitHub Packages)

1. Add to `package.json`:
```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

2. Create `.npmrc` in project root:
```
@ui-ux:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

3. Publish:
```bash
npm publish
```

### 11.3 Azure Artifacts (Alternative)

Similar setup with Azure's registry URL in `.npmrc`.

---

## 12. Component Priority Roadmap

### Phase 1: Core Components (MVP) - Pure React
| Component | Type | Priority |
|-----------|------|----------|
| Button | Pure React | P0 |
| InputText | Pure React | P0 |
| Checkbox | Pure React | P0 |
| RadioButton | Pure React | P0 |
| Card | Pure React | P0 |
| Badge | Pure React | P0 |
| Spinner | Pure React | P0 |

### Phase 2: Form Components - Mixed
| Component | Type | Priority |
|-----------|------|----------|
| InputTextarea | Pure React | P1 |
| Switch/Toggle | Pure React | P1 |
| InputNumber | Pure React or PrimeReact | P1 |
| Dropdown/Select | PrimeReact | P1 |
| Calendar/DatePicker | PrimeReact | P1 |

### Phase 3: Complex Components - PrimeReact
| Component | Type | Priority |
|-----------|------|----------|
| Dialog/Modal | PrimeReact | P1 |
| Toast | PrimeReact | P1 |
| DataTable | PrimeReact | P1 |
| AutoComplete | PrimeReact | P2 |
| MultiSelect | PrimeReact | P2 |

### Phase 4: Layout & Feedback
| Component | Type | Priority |
|-----------|------|----------|
| Divider | Pure React | P2 |
| Avatar | Pure React | P2 |
| Tooltip | PrimeReact | P2 |
| Menu | PrimeReact | P2 |
| TabView | PrimeReact | P2 |
| Accordion | PrimeReact | P2 |

---

## 13. Testing Strategy

### 13.1 Unit Testing with Vitest

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**vitest.config.ts**
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

### 13.2 Visual Regression with Chromatic

Integrate with Storybook for visual testing:
```bash
npx chromatic --project-token=<your-token>
```

---

## 14. Accessibility Requirements

All components must meet WCAG 2.1 AA standards:

- **Focus Management:** Visible focus indicators (`:focus-visible`)
- **Keyboard Navigation:** All interactive elements must be keyboard accessible
- **Color Contrast:** Minimum 4.5:1 for text, 3:1 for UI elements
- **ARIA Labels:** Proper labeling for screen readers
- **Reduced Motion:** Respect `prefers-reduced-motion` media query

For Pure React components, ensure:
- Proper semantic HTML elements (`<button>`, `<input>`, etc.)
- ARIA attributes where needed
- Focus states are visible

PrimeReact components handle most a11y automatically.

---

## 15. Versioning & Changelog

### Semantic Versioning (SemVer)
- **MAJOR (X.0.0):** Breaking changes
- **MINOR (0.X.0):** New features (backward compatible)
- **PATCH (0.0.X):** Bug fixes (backward compatible)

### Changelog Format
Maintain `CHANGELOG.md` with sections:
- **Added:** New features
- **Changed:** Changes in existing functionality
- **Deprecated:** Soon-to-be removed features
- **Removed:** Removed features
- **Fixed:** Bug fixes
- **Security:** Vulnerability fixes

---

## 16. Known Tech Debt & Future Improvements

### Phase 2 Considerations

| Item | Current State | Future Improvement |
|------|---------------|-------------------|
| **CSS Bundling** | Single `ui-ux.css` file | Consider per-component CSS for better tree-shaking |
| **PrimeReact Styling** | Manual className on each component | Explore PrimeReact's global PT (Passthrough) API |
| **Icon System** | Uses PrimeIcons | Consider custom icon component with SVG support |
| **Form Integration** | Basic props | Document patterns for React Hook Form, Formik |

These are **not MVP blockers** but should be addressed as the library matures.

---

## 17. Summary

| Aspect | Decision |
|--------|----------|
| **Architecture** | Provider-free, standalone components |
| **Component Types** | Pure React (simple) + PrimeReact (complex) |
| **Class Handling** | `cn()` utility (clsx + tailwind-merge) |
| **CSS Strategy** | Separate CSS file (consumers import explicitly) |
| **Folder Structure** | Co-located (all files in component folder) |
| **Token System** | CSS Variables (colors, spacing, typography, shadows, borders, z-index) |
| **Dark Mode** | `data-theme="dark"` attribute (no provider) |
| **PrimeReact** | Optional dependency, `unstyled` per-component |
| **Build Output** | ES + CJS modules, separate CSS, TypeScript declarations |
| **Testing** | Vitest + React Testing Library + Chromatic |

This architecture provides:
- ✅ **Minimal Setup:** Import component + CSS, use immediately
- ✅ **Safe Overrides:** Consumers can safely override styles via className
- ✅ **Independence:** No provider dependency, no context issues
- ✅ **Flexibility:** Mix pure React and PrimeReact components freely
- ✅ **Tree-Shaking:** Only bundle what you use
- ✅ **Speed:** Vite build
- ✅ **Power:** PrimeReact for complex components only
- ✅ **Branding:** Total visual control via CSS Variables
- ✅ **Reliability:** tailwind-merge prevents className conflicts
- ✅ **Maintainability:** Co-located component structure
