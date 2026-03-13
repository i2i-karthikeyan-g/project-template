# ESLint Configuration — Senior Architect Recommendation

> **Stack**: React 19 · TypeScript 5.9 · Vite 7 · Storybook 10 · SCSS · Vitest  
> **ESLint**: v9 Flat Config (`eslint.config.js`)  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [The Recommended Configuration](#3-the-recommended-configuration)
4. [Line-by-Line Architectural Decisions](#4-line-by-line-architectural-decisions)
5. [Plugin Selection — Why This, Why Not That](#5-plugin-selection--why-this-why-not-that)
6. [Installation](#6-installation)
7. [Package.json Scripts & lint-staged](#7-packagejson-scripts--lint-staged)
8. [Prettier Configuration](#8-prettier-configuration)
9. [FAQ & Common Objections](#9-faq--common-objections)

---

## 1. Executive Summary

This document defines the **production-grade ESLint configuration** for a React UI component library.

A component library is not a regular application. Every bug, every inconsistency, every accessibility failure you ship **multiplies across every consumer**. The linting strategy must reflect this: **strict where it matters, relaxed only where strictness creates false positives** (stories, tests).

The configuration is built on four principles:

1. **Type safety** — Use type-aware linting (`strictTypeChecked`) because the TypeScript compiler alone does not catch logic-level anti-patterns.
2. **Accessibility by default** — Every component must pass `jsx-a11y` checks. The library name has "ally" in it — a11y is not an afterthought.
3. **Formatting is not linting** — Prettier handles formatting. ESLint handles correctness. They never overlap. `eslint-config-prettier` enforces this boundary.
4. **Structured readability** — In a component library, every file follows the same import pattern (types → packages → internals → relative → styles). Enforce this with named groups, not regex. Avoid preset-level stylistic rules that churn on major upgrades.

### Revision 3 — Changes from Peer Review + Architecture Reassessment

| Change | Rationale |
|--------|-----------|
| Dropped `stylisticTypeChecked` | Stylistic presets cause noisy diffs and lint churn on upgrades. Cherry-pick the 2 rules worth keeping instead. |
| Kept `perfectionist` (reversed Rev 2 switch to `simple-import-sort`) | A component library needs named import groups (type → external → internal → relative → style) and JSX prop sorting. `perfectionist` handles both natively with self-documenting config. `simple-import-sort` requires fragile regex for the same result. |
| Added `eslint-plugin-import-x` with `no-cycle` | Circular dependencies break builds and tree-shaking. Critical for libraries. |
| Added `react/jsx-no-leaked-render` | Catches `{count && <Component />}` rendering `0` — a top-5 React bug. |
| Added `react/require-default-props: 'off'` | Defensive explicit disable; modern React uses default params, not `defaultProps`. |
| Added `eslint-plugin-vitest` | Catches empty tests, conditional tests, duplicate titles — real test-quality bugs. |

---

## 2. Current State Analysis

### What exists default (`eslint.config.js`)

```js
export default defineConfig([globalIgnores(['dist']), {
  files: ['**/*.{ts,tsx}'],
  extends: [
    js.configs.recommended,
    tseslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
  ],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
}, ...storybook.configs["flat/recommended"]])
```

### Gaps identified

| Gap | Risk | Severity |
|-----|------|----------|
| No type-aware linting (`recommended` instead of `strictTypeChecked`) | Misses bugs that only type information reveals (e.g., `no-floating-promises`, `no-misused-promises`) | **High** |
| No `eslint-plugin-react` | Misses `display-name`, `no-unstable-nested-components`, `jsx-no-leaked-render` | **High** |
| No `eslint-plugin-jsx-a11y` | Zero accessibility enforcement on a library called "ally" | **Critical** |
| No circular dependency detection | `Button → utils → Button` silently breaks tree-shaking and bundler output | **High** |
| No `eslint-config-prettier` | ESLint and Prettier fight over formatting rules | **Medium** |
| No import ordering | Random import order increases merge conflicts | **Low** |
| No `consistent-type-imports` | Type imports bundled as runtime code → larger bundles, potential circular deps | **Medium** |
| No `no-console` rule | Library ships `console.log` to consumers | **High** |
| No `jsx-no-leaked-render` | `{0 && <Component />}` renders `0` in the DOM | **High** |
| No Vitest lint rules | Tests without assertions silently pass, inflating coverage | **Medium** |
| `ecmaVersion: 2020` hardcoded | Unnecessarily limits language features | **Low** |

---

## 3. The Recommended Configuration

### `eslint.config.js`

```js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';

import storybook from 'eslint-plugin-storybook';
import perfectionist from 'eslint-plugin-perfectionist';
import importX from 'eslint-plugin-import-x';
import vitest from 'eslint-plugin-vitest';

import eslintConfigPrettier from 'eslint-config-prettier';

import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([

  // ──────────────────────────────────────────────
  // 1. GLOBAL IGNORES
  // ──────────────────────────────────────────────

  globalIgnores([
    'dist',
    'build',
    'coverage',
    'storybook-static',
    'node_modules',
    '**/*.d.ts',
  ]),

  // ──────────────────────────────────────────────
  // 2. BASE JAVASCRIPT RULES
  // ──────────────────────────────────────────────

  js.configs.recommended,

  // ──────────────────────────────────────────────
  // 3. TYPESCRIPT — STRICT TYPE-AWARE LINTING
  // ──────────────────────────────────────────────

  ...tseslint.configs.strictTypeChecked,

  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-floating-promises': 'error',

      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],

      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    },
  },

  // ──────────────────────────────────────────────
  // 4. REACT + JSX ACCESSIBILITY
  // ──────────────────────────────────────────────

  {
    files: ['**/*.{jsx,tsx}'],

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },

    settings: {
      react: { version: 'detect' },
    },

    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/display-name': 'error',
      'react/no-unstable-nested-components': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react/no-array-index-key': 'warn',
      'react/self-closing-comp': 'error',

      'jsx-a11y/anchor-is-valid': 'warn',
    },
  },

  // ──────────────────────────────────────────────
  // 5. VITE FAST REFRESH (SRC ONLY)
  // ──────────────────────────────────────────────

  {
    files: ['src/**/*.{jsx,tsx}'],

    plugins: {
      'react-refresh': reactRefresh,
    },

    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // ──────────────────────────────────────────────
  // 6. IMPORT SORTING & CODE ORGANIZATION
  // ──────────────────────────────────────────────

  {
    plugins: { perfectionist },

    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          groups: [
            'type',
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'side-effect',
            'style',
          ],
        },
      ],

      'perfectionist/sort-exports': [
        'error',
        { type: 'natural', order: 'asc' },
      ],

      'perfectionist/sort-jsx-props': [
        'warn',
        { type: 'natural', order: 'asc' },
      ],
    },
  },

  // ──────────────────────────────────────────────
  // 7. IMPORT SAFETY — CIRCULAR DEPENDENCY DETECTION
  // ──────────────────────────────────────────────

  {
    files: ['src/**/*.{ts,tsx}'],

    plugins: {
      'import-x': importX,
    },

    settings: {
      'import-x/resolver': {
        typescript: true,
      },
    },

    rules: {
      'import-x/no-cycle': ['error', { maxDepth: 4 }],
    },
  },

  // ──────────────────────────────────────────────
  // 8. LIBRARY SAFETY RULES
  // ──────────────────────────────────────────────

  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
    },
  },

  // ──────────────────────────────────────────────
  // 9. STORYBOOK FILES
  // ──────────────────────────────────────────────

  {
    files: ['**/*.stories.@(ts|tsx|js|jsx|mjs|cjs|mdx)'],

    extends: [storybook.configs['flat/recommended']],

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },

  // ──────────────────────────────────────────────
  // 10. TEST FILES + VITEST RULES
  // ──────────────────────────────────────────────

  {
    files: ['**/*.test.@(ts|tsx)', '**/*.spec.@(ts|tsx)'],

    plugins: {
      vitest,
    },

    rules: {
      ...vitest.configs.recommended.rules,

      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },

  // ──────────────────────────────────────────────
  // 11. PRETTIER — MUST BE LAST
  // ──────────────────────────────────────────────

  eslintConfigPrettier,
]);
```

---

## 4. Line-by-Line Architectural Decisions

### Section 1: Global Ignores

```js
globalIgnores([
  'dist',          // Build output — never lint compiled code
  'build',         // Alternative build output directory
  'coverage',      // Vitest coverage reports
  'storybook-static', // Storybook build output
  'node_modules',  // Dependencies
  '**/*.d.ts',     // Generated type declarations — read-only artifacts
]),
```

**Why `globalIgnores()` instead of `.eslintignore`**: ESLint 9 flat config has no `.eslintignore` support. `globalIgnores()` is the native replacement. It's evaluated at config load time and is faster than per-file `ignores` blocks.

**Why `**/*.d.ts`**: The library generates `.d.ts` files via `vite-plugin-dts`. These are machine-generated — linting them wastes cycles and produces false positives.

---

### Section 2: Base JavaScript Rules

```js
js.configs.recommended,
```

**Why**: Provides the baseline: `no-undef`, `no-unused-vars` (overridden by TS version later), `no-redeclare`, `no-extra-boolean-cast`, etc. These are uncontroversial safety rules that every JS project needs.

**Why not `js.configs.all`**: `all` enables every rule, including highly opinionated ones like `no-ternary` and `sort-vars`. It's designed for exploration, not production.

---

### Section 3: TypeScript — Strict Type-Aware Linting

```js
...tseslint.configs.strictTypeChecked,
```

**The decision: `strictTypeChecked` vs `recommendedTypeChecked` vs `recommended`**

| Preset | Type-aware | Strictness | Best for |
|--------|-----------|------------|----------|
| `recommended` | No | Low | Prototypes, learning projects |
| `recommendedTypeChecked` | Yes | Medium | Applications |
| `strictTypeChecked` | Yes | High | **Libraries** |

**Why `strictTypeChecked` for a library**: A library's bugs propagate to every consumer. `strictTypeChecked` catches:
- `@typescript-eslint/no-floating-promises` — Unhandled async operations that silently fail
- `@typescript-eslint/no-unnecessary-condition` — Dead code that confuses maintainers
- `@typescript-eslint/restrict-template-expressions` — Prevents `[object Object]` in strings

**Why not just `recommended`**: `recommended` doesn't use type information at all. It's essentially "TypeScript compiler output + basic pattern matching." It misses entire categories of bugs that require type analysis.

#### Why `strictTypeChecked` only — NOT `stylisticTypeChecked`

**Revision 2 change**: The original config included `...tseslint.configs.stylisticTypeChecked`. This has been removed based on peer review.

`stylisticTypeChecked` enables preset-level rules like `prefer-nullish-coalescing`, `prefer-optional-chain`, `consistent-type-definitions`, `prefer-for-of`, `prefer-string-starts-ends-with`, etc. The problem:

1. **Lint churn on upgrades** — When you upgrade typescript-eslint from v8 to v9, stylistic presets may add new rules or change existing rule behavior. This generates hundreds of lint errors across the codebase that have nothing to do with actual bugs. Teams spend an entire sprint fixing "style" violations instead of shipping features.

2. **Noisy diffs** — A developer running `eslint --fix` touches 40 files because of stylistic autofixes. This creates merge conflicts that block other PRs and pollute git history.

3. **Team friction** — Stylistic rules are subjective. One developer prefers `interface`, another prefers `type`. `stylisticTypeChecked` forces one choice without buy-in, generating resentment.

**The better approach: cherry-pick the 2 rules worth keeping.**

```js
'@typescript-eslint/prefer-optional-chain': 'warn',
'@typescript-eslint/prefer-nullish-coalescing': 'warn',
```

These two rules prevent real bugs (optional chain avoids null reference crashes; nullish coalescing avoids `||` treating `0` and `''` as falsy). They earn their keep. The other 15+ rules in the stylistic preset do not.

**Why `warn` not `error` for these**: They are correctness-adjacent but not always clearcut. `warn` flags the pattern without blocking commits; the team can fix them incrementally. If the team agrees they want strict enforcement, escalate to `error`.

---

### Parser Options Deep Dive

```js
languageOptions: {
  parserOptions: {
    projectService: true,
    tsconfigRootDir: import.meta.dirname,
  },
  globals: {
    ...globals.browser,
    ...globals.es2024,
  },
},
```

**`projectService: true` vs `project: './tsconfig.json'`**

| Feature | `project` (old) | `projectService` (new) |
|---------|-----------------|----------------------|
| Speed | Slower — creates a full TS program | Faster — uses TS Language Service API |
| Multi-tsconfig | Must list each file path | Auto-discovers nearest tsconfig |
| Project references | Requires manual setup | Handles automatically |
| Available since | Always | typescript-eslint v8 (2024) |

**Decision**: `projectService: true`. It's faster, simpler, and handles the project's `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` references automatically.

**`tsconfigRootDir: import.meta.dirname`**: Tells the parser where to start looking for tsconfig files. `import.meta.dirname` resolves to the directory containing `eslint.config.js`. This is critical when running ESLint from a different working directory (e.g., CI).

**`globals.es2024` instead of `globals.es2020`**: The current config uses `ecmaVersion: 2020`, which artificially limits available globals. The `tsconfig.app.json` targets `ES2022`. There's no reason to restrict globals below the TS target. `es2024` includes `structuredClone`, `Array.prototype.at()`, etc.

---

### TypeScript Rules

```js
'@typescript-eslint/no-explicit-any': 'error',
```

**Why `error` not `warn`**: In a library, `any` destroys the type contract with consumers. If a component prop is typed as `any`, consumers get zero IntelliSense, zero type safety. This defeats the purpose of TypeScript.

**Counter-argument**: "But sometimes you need `any` for generic wrappers." **Rebuttal**: Use `unknown` and narrow with type guards. If you truly need `any`, use `// eslint-disable-next-line` with a comment explaining why. Exceptions should be explicit, not systemic.

---

```js
'@typescript-eslint/consistent-type-imports': [
  'error',
  {
    prefer: 'type-imports',
    fixStyle: 'inline-type-imports',
  },
],
```

**Why**: Type-only imports (`import { type ButtonProps }`) are erased at compile time. This:
1. Reduces bundle size — the import statement is completely removed
2. Avoids circular dependency issues — type imports don't create runtime dependency edges
3. Makes intent explicit — a reader immediately knows "this is a type, not a runtime value"

**Why `inline-type-imports` over separate import statements**: 

```ts
// 'inline-type-imports' (our choice)
import { type ButtonProps, Button } from './Button';

// 'separate-type-imports' (alternative)
import type { ButtonProps } from './Button';
import { Button } from './Button';
```

Inline is more concise. One import line per module, not two. The `type` keyword is visible at the import-specifier level, which is sufficient.

**Counter-argument**: "Separate type imports are clearer." **Rebuttal**: With inline, the `type` keyword is right next to the identifier. It's just as clear with fewer lines.

---

```js
'@typescript-eslint/no-unused-vars': [
  'error',
  {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
  },
],
```

**Why**: Dead code in a library is dead weight that confuses contributors. The `^_` pattern allows intentional unused variables (common in destructuring: `const [_, second] = tuple`).

**Why this overrides the base `no-unused-vars`**: The TypeScript version understands type-only usages, enums, and declaration merging. The base ESLint rule produces false positives on TypeScript code.

---

```js
'@typescript-eslint/no-floating-promises': 'error',
```

**Why**: A floating promise is an async operation whose rejection is silently swallowed. In a library, this creates bugs that are impossible for consumers to debug — the error vanishes into the void.

```ts
// BAD: promise rejection is lost
async function handleClick() {
  fetchData(); // no await, no .catch()
}

// GOOD: error propagates
async function handleClick() {
  await fetchData();
}
```

---

```js
'@typescript-eslint/no-misused-promises': [
  'error',
  { checksVoidReturn: { attributes: false } },
],
```

**Why the exception**: React event handlers (`onClick`, `onChange`) expect `void` return types, but async event handlers return `Promise<void>`. Without `attributes: false`, every `onClick={async () => {...}}` would error. This is a known React + TypeScript friction point.

---

### Section 4: React + JSX Accessibility

```js
...reactPlugin.configs.recommended.rules,
...reactPlugin.configs['jsx-runtime'].rules,
```

**Why `recommended` + `jsx-runtime`**: The `recommended` preset includes safety rules. The `jsx-runtime` preset turns off `react/jsx-uses-react` and `react/react-in-jsx-scope` — both are unnecessary since React 17's automatic JSX transform. The project uses React 19 with `"jsx": "react-jsx"` in tsconfig.

**Why not `reactPlugin.configs.flat.recommended`**: The flat config presets include plugin registration. Since we're manually composing plugins (to also include `jsx-a11y`), we spread the `.rules` object directly to avoid duplicate plugin registration.

---

```js
'react/prop-types': 'off',
```

**Why off**: The project uses TypeScript for prop validation. `prop-types` is a runtime validation library for vanilla JavaScript React. Enabling this rule alongside TypeScript means maintaining two parallel prop validation systems. TypeScript is strictly superior here.

---

```js
'react/require-default-props': 'off',
```

**Why explicitly off**: Modern React uses default parameter values in function signatures, not the legacy `Component.defaultProps` API. React 19 has deprecated `defaultProps` for function components entirely. This rule is off by default in the `recommended` preset, but we set it explicitly as defensive coding — if a future preset update re-enables it, our config still works correctly.

```tsx
// LEGACY pattern (what this rule enforces — we don't want this)
Button.defaultProps = { variant: 'primary' };

// MODERN pattern (what we use instead)
function Button({ variant = 'primary' }: ButtonProps) { ... }
```

---

```js
'react/display-name': 'error',
```

**Why `error` for a library**: When a consumer wraps your component in `React.memo()`, `React.forwardRef()`, or a HOC, React DevTools shows "Anonymous" in the component tree if `displayName` is missing. For a library, this makes debugging nearly impossible for consumers.

```tsx
// BAD: shows as "Anonymous" in DevTools
export const Button = React.forwardRef((props, ref) => { ... });

// GOOD: shows as "Button" in DevTools
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) { ... }
);
```

---

```js
'react/no-unstable-nested-components': 'error',
```

**Why**: Defining a component inside another component's render causes a new component instance on every render. This destroys component state and forces a full remount — a severe performance bug that's invisible in development but devastating in production.

```tsx
// BAD: Icon remounts every time Parent re-renders
function Parent() {
  const Icon = () => <svg>...</svg>;  // new component each render
  return <Icon />;
}

// GOOD: defined outside
const Icon = () => <svg>...</svg>;
function Parent() {
  return <Icon />;
}
```

---

```js
'react/jsx-no-leaked-render': 'error',
```

**Why this is critical**: This catches one of the top-5 most common React bugs. When using `&&` for conditional rendering with a non-boolean left operand, React renders the falsy value instead of nothing:

```tsx
// BUG: renders the number 0 in the DOM when items is empty
{items.length && <List items={items} />}

// BUG: renders the string "" in the DOM when name is empty
{name && <Greeting name={name} />}

// FIXED: explicit boolean coercion
{items.length > 0 && <List items={items} />}

// ALSO FIXED: ternary
{items.length ? <List items={items} /> : null}
```

React 19 emits a runtime warning for this pattern, but catching it at lint time is strictly better — the bug never reaches the browser. This rule has zero false positives in practice.

**Why it was missing in Revision 1**: An oversight. This should have been in the original config.

---

```js
...jsxA11y.configs.recommended.rules,
```

**Why a11y is non-negotiable**: This is a UI component library. If a `<Button>` component renders without proper ARIA attributes, every consumer inherits that accessibility failure. The WCAG 2.1 AA standard is a legal requirement in many jurisdictions (ADA, EN 301 549, EAA).

Key rules included:
- `jsx-a11y/alt-text` — Images must have alt text
- `jsx-a11y/aria-props` — Only valid ARIA attributes allowed
- `jsx-a11y/role-has-required-aria-props` — Roles must have their required ARIA props
- `jsx-a11y/interactive-supports-focus` — Interactive elements must be focusable
- `jsx-a11y/click-events-have-key-events` — Click handlers must have keyboard equivalents

**Why `recommended` over `strict`**: The `strict` preset prohibits some patterns that are valid in component libraries (e.g., non-interactive elements with handlers where the component adds the handler internally). `recommended` catches the important issues without false positives on advanced component patterns.

---

### Section 5: Vite Fast Refresh

```js
{
  files: ['src/**/*.{jsx,tsx}'],
  ...
  'react-refresh/only-export-components': [
    'warn',
    { allowConstantExport: true },
  ],
},
```

**Why scoped to `src/**` only**: React Refresh (Vite HMR) only applies to source files. Stories and tests are not hot-reloaded in the same way. Applying this rule to story files produces false positives because stories export `meta` objects, not React components.

**Why `allowConstantExport: true`**: Vite's React Refresh plugin can handle constant exports alongside components. Without this, exporting a constant from a component file (e.g., `export const BUTTON_SIZES = [...]`) would trigger a warning, even though Vite handles it correctly.

**Why `warn` not `error`**: This rule catches dev-experience issues, not production bugs. A component file that breaks HMR still works in production — it just loses hot reload during development.

---

### Section 6: Import Sorting & Code Organization

```js
{
  plugins: { perfectionist },
  rules: {
    'perfectionist/sort-imports': ['error', {
      type: 'natural',
      order: 'asc',
      groups: [
        'type',
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling', 'index'],
        'side-effect',
        'style',
      ],
    }],
    'perfectionist/sort-exports': ['error', { type: 'natural', order: 'asc' }],
    'perfectionist/sort-jsx-props': ['warn', { type: 'natural', order: 'asc' }],
  },
},
```

**Revision 3 change**: Kept `eslint-plugin-perfectionist`. Revision 2 switched to `simple-import-sort` based on peer feedback favoring stability. After architectural reassessment, this was reversed because a UI component library has specific needs that `perfectionist` handles natively and `simple-import-sort` handles poorly.

#### Why `perfectionist` is the right tool for a component library

Every component file in this library follows the same import structure:

```tsx
import type { ButtonProps } from './Button.types';

import { forwardRef } from 'react';
import clsx from 'clsx';

import { useTheme } from '@/hooks';
import { tokens } from '@/tokens';

import { getVariant } from './utils';

import styles from './button.module.scss';
```

This pattern repeats across every component, story, and test. In a design system, this consistency is not a preference — it's a readability contract. When a developer opens any file, they should instantly know where to find types, dependencies, internal modules, and styles.

**`perfectionist` handles this with named groups**:

```js
groups: ['type', 'builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'side-effect', 'style']
```

Self-documenting. A new contributor reads this config and immediately understands the import order policy. Adding a new group (e.g., separating `@/hooks` from `@/tokens`) means adding a string to an array.

**`simple-import-sort` requires regex for the same result**:

```js
groups: [
  ['^.*\\u0000$'],      // type imports (??)
  ['^node:'],            // builtins
  ['^@?\\w'],            // external
  ['^@/'],               // internal
  ['^\\.'],              // relative
  ['^.+\\.s?css$'],     // styles
]
```

This works but is fragile, non-obvious, and hostile to new contributors. The `'^.*\\u0000$'` pattern for type imports is opaque. Nobody reads that and understands what it does.

#### The JSX prop sorting bonus

For a component library where components can have 10-15+ props, alphabetical prop ordering makes the API scannable:

```tsx
<Button
  aria-label="Submit"
  className={styles.primary}
  disabled={isLoading}
  onClick={handleSubmit}
  size="large"
  type="submit"
  variant="primary"
/>
```

`perfectionist/sort-jsx-props` enforces this automatically. `simple-import-sort` has no equivalent — you'd need a second plugin.

**Why `warn` not `error` for prop sorting**: Prop order is readability, not correctness. `warn` flags it without blocking commits. Import order is `error` because disordered imports cause merge conflicts.

#### Group ordering rationale

1. `type` — Type imports first, clearly separated from runtime imports
2. `builtin` — Node.js built-ins (`path`, `fs`)
3. `external` — npm packages (`react`, `clsx`)
4. `internal` — Project aliases (`@/components/...`)
5. `parent/sibling/index` — Relative imports, grouped together
6. `side-effect` — `import './polyfill'` (no bindings)
7. `style` — `import './button.scss'` — styles last, clearly at the bottom

**Why `type: 'natural'`**: Natural sorting handles numbers correctly: `item2` before `item10`. Alphabetical sorting would put `item10` before `item2`.

---

### Section 7: Import Safety — Circular Dependency Detection

```js
{
  files: ['src/**/*.{ts,tsx}'],
  plugins: {
    'import-x': importX,
  },
  settings: {
    'import-x/resolver': {
      typescript: true,
    },
  },
  rules: {
    'import-x/no-cycle': ['error', { maxDepth: 4 }],
  },
},
```

**Revision 2 addition**: This section was missing in Revision 1. Peer review correctly identified this as a critical gap.

**Why circular dependency detection is critical for libraries**:

```
Button.tsx → useTheme.ts → ThemeProvider.tsx → Button.tsx
```

This circular chain causes:
- **Runtime `undefined`** — The module that loads second gets an uninitialized reference
- **Bundler failures** — Rollup/Vite can't determine a valid module execution order
- **Tree-shaking breaks** — The bundler can't prove any export is unused when modules reference each other

**Why `eslint-plugin-import-x` instead of `eslint-plugin-import`**: `import-x` is the actively maintained fork of `eslint-plugin-import`. The original package is semi-abandoned with hundreds of open issues. `import-x` has native ESLint 9 flat config support, better TypeScript integration, and active maintenance.

**Why `maxDepth: 4`**: Without a depth limit, `no-cycle` traverses the entire import graph — O(n^2) on every file. For 2 components, this is instant. For 200 components, it could add 30+ seconds to lint time. `maxDepth: 4` catches 99% of real cycles (most are 2-3 hops deep) while keeping performance bounded.

**Why scoped to `src/**`**: Only lint source files for cycles. Config files, stories, and test files are leaf nodes — they import things but nothing imports them. Cycle detection on them is wasted work.

**Performance note**: If lint times grow significantly as the library scales, consider:
1. Increasing `maxDepth` is always slower, decreasing it trades detection for speed
2. Moving cycle detection to CI as a standalone step using `madge --circular` (purpose-built, faster)
3. Keeping the ESLint rule for editor feedback but running it only on changed files via `lint-staged`

**Why we don't import more from `import-x`**: Rules like `import-x/no-unresolved` are redundant — TypeScript's compiler already catches unresolved imports. `import-x/order` is redundant — `perfectionist` handles import ordering with named groups. We use `import-x` for exactly one thing: `no-cycle`.

---

### Section 8: Library Safety Rules

```js
'no-console': ['warn', { allow: ['warn', 'error'] }],
```

**Why `warn` not `error`**: A library should never ship `console.log`, but `console.warn` is legitimate for deprecation warnings (e.g., "This prop will be removed in v3") and `console.error` for invariant violations. Using `warn` instead of `error` allows developers to keep `console.log` during active development without blocking their workflow — the CI/pre-commit hook catches it before merge.

---

```js
'prefer-const': 'error',
'no-var': 'error',
```

**Why**: `const` communicates intent — "this binding never changes." `let` signals "this will be reassigned." `var` has function-scoping bugs and hoisting surprises. In modern ES modules, there is zero reason to use `var`.

---

```js
curly: ['error', 'all'],
eqeqeq: ['error', 'always'],
```

**Why `curly: 'all'`**: Requires braces on all control flow, even single-line. This prevents the "dangling else" class of bugs and makes diffs cleaner (adding a second statement to an `if` doesn't change the surrounding lines).

```js
// BAD: adding a second line creates a bug
if (loading) return null;

// GOOD: safe to extend
if (loading) {
  return null;
}
```

**Why `eqeqeq: 'always'`**: `==` performs type coercion (`0 == ''` is `true`). This is a classic JS bug factory. In a typed library, you should always know the types of your operands. Use `===`.

---

### Section 9: Storybook Files

```js
{
  files: ['**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)'],
  extends: [storybook.configs['flat/recommended']],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'react-refresh/only-export-components': 'off',
  },
},
```

**Why relax `no-explicit-any` in stories**: Stories are documentation and examples. They sometimes need `any` for generic wrapper patterns or for demonstrating component behavior with arbitrary data. The cost of `any` in stories is zero — consumers never import story code.

**Why turn off `react-refresh`**: Story files export `meta` objects and arg types alongside components. These are not React components and trigger false positives from the refresh rule.

**Storybook plugin rules**: The `flat/recommended` preset includes:
- `storybook/await-interactions` — Play functions must `await` interactions
- `storybook/no-uninstalled-addons` — Referenced addons must be installed
- `storybook/prefer-pascal-case` — Story names use PascalCase

---

### Section 10: Test Files + Vitest Rules

```js
{
  files: ['**/*.test.@(ts|tsx)', '**/*.spec.@(ts|tsx)'],
  plugins: {
    vitest,
  },
  rules: {
    ...vitest.configs.recommended.rules,

    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
  },
},
```

**Revision 2 change**: Added `eslint-plugin-vitest` with its recommended preset.

**Why Vitest-specific linting matters**: The original config only relaxed strict TS rules in tests. That prevents false positives but doesn't catch test-specific bugs. `eslint-plugin-vitest` adds proactive detection:

| Rule | What it catches | Why it matters |
|------|----------------|----------------|
| `vitest/expect-expect` | Tests with no `expect()` call | A test that never asserts always passes — it tests nothing but inflates coverage numbers |
| `vitest/no-identical-title` | Duplicate `it()` / `test()` descriptions | Makes test output confusing; you can't tell which "should render correctly" failed |
| `vitest/no-conditional-tests` | `if` statements inside tests | Non-deterministic tests that pass sometimes and fail other times |
| `vitest/valid-expect` | Malformed `expect()` calls | `expect(foo)` without a matcher silently does nothing |
| `vitest/no-focused-tests` | Leftover `.only` in committed code | Skips all other tests in CI without anyone noticing |

**Why relax strict TS rules in tests**: Test files have fundamentally different constraints:
- `no-explicit-any` off — Mock data and test utilities often need `any`
- `no-non-null-assertion` off — In tests, you know the DOM element exists because you just rendered it: `screen.getByRole('button')!`
- `no-unsafe-assignment/member-access` off — Test assertions on mock objects produce false positives from type-aware rules

**Why NOT relax everything**: We keep hooks rules, accessibility rules, and other safety rules active in tests. Tests should still use valid React patterns.

---

### Section 11: Prettier — Must Be Last

```js
eslintConfigPrettier,
```

**Why it must be last**: `eslint-config-prettier` disables every ESLint rule that conflicts with Prettier formatting (indentation, quotes, semicolons, trailing commas, etc.). If any config object comes AFTER this one, it could re-enable a formatting rule that Prettier owns — creating a conflict where ESLint and Prettier fight over the same code.

**Why `eslint-config-prettier` instead of `eslint-plugin-prettier`**:

| Approach | How it works | Speed | Recommendation |
|----------|-------------|-------|----------------|
| `eslint-config-prettier` | Disables conflicting rules | Fast — ESLint runs normally | **Recommended** |
| `eslint-plugin-prettier` | Runs Prettier inside ESLint | Slow — double-parses every file | Not recommended |

The ESLint team, Prettier team, and typescript-eslint team all recommend the config approach. Run Prettier separately (via `prettier --write` or `lint-staged`), not inside ESLint.

---

## 5. Plugin Selection — Why This, Why Not That

### Plugins INCLUDED (and why)

#### `@eslint/js` (ESLint Core)
Foundational JS rules. No alternative exists. Required.

#### `typescript-eslint`
The only TypeScript ESLint integration. No alternative exists. Required.

#### `eslint-plugin-react`
Catches React-specific anti-patterns: `display-name`, `no-unstable-nested-components`, `jsx-no-target-blank`, `jsx-no-leaked-render`. The React Hooks plugin alone does NOT cover these.

**Counter-argument**: "TypeScript + hooks is enough."  
**Rebuttal**: TypeScript catches type errors. Hooks plugin catches hooks violations. Neither catches `display-name`, nested components, leaked renders, or `target="_blank"` security issues. For a library, these gaps are unacceptable.

#### `eslint-plugin-react-hooks`
Enforces Rules of Hooks (`rules-of-hooks`, `exhaustive-deps`). Non-negotiable for any React project. A hooks violation causes silent, devastating bugs at runtime.

#### `eslint-plugin-react-refresh`
Validates Vite HMR compatibility. Without it, components silently lose hot reload during development, slowing iteration speed.

#### `eslint-plugin-jsx-a11y`
Validates accessibility at the JSX level. For a UI component library, every component must be accessible by default. Consumers should not have to fix your accessibility bugs.

#### `eslint-plugin-storybook`
Validates Storybook CSF (Component Story Format) patterns. Catches common mistakes in story files — missing `await` in play functions, incorrect meta structure.

#### `eslint-plugin-perfectionist`
Named import groups, export sorting, and JSX prop sorting in one plugin. For a component library where every file follows the same type → external → internal → relative → style pattern, named groups are self-documenting and maintainable. Also provides `sort-jsx-props` for scannable component APIs.

#### `eslint-plugin-import-x`
The actively maintained fork of `eslint-plugin-import`. Used here exclusively for `no-cycle` — circular dependency detection that prevents runtime failures and tree-shaking breakage.

#### `eslint-plugin-vitest`
Catches test-quality bugs: missing assertions, conditional tests, duplicate titles, leftover `.only`. Cheap to add, catches real problems.

#### `eslint-config-prettier`
Disables all ESLint rules that conflict with Prettier. Required when using Prettier (which we are).

---

### `perfectionist` vs `simple-import-sort` vs `eslint-plugin-import`

This is the most debated decision. Here's the three-way comparison:

| Feature | `eslint-plugin-import` | `perfectionist` | `simple-import-sort` |
|---------|----------------------|-----------------|---------------------|
| Import sorting | Yes | **Yes** | Yes |
| Export sorting | No | **Yes** | Yes |
| JSX prop sorting | No | **Yes** | No |
| Named group config | No | **Yes** (self-documenting) | No (regex-based) |
| Circular deps | Yes (`no-cycle`) | No | No |
| Unresolved imports | Yes (`no-unresolved`) | No | No |
| Needs module resolver | **Yes** | No | No |
| TS path alias support | Fragile (needs resolver) | **Native** | Native |
| Performance | **Slow** | **Fast** | Fast |
| Config complexity | Medium | Medium (named groups) | Zero (but regex for custom groups) |
| npm downloads/week | ~25M (legacy) | ~1.5M | ~5M |
| Stability | Semi-abandoned | Growing, actively maintained | Very stable |

**Decision**: `perfectionist` for sorting + `import-x/no-cycle` for circular deps.

**Rationale**:
1. **Named groups over regex** — `perfectionist` uses `['type', 'builtin', 'external', 'internal', ...]` while `simple-import-sort` uses `['^.*\\u0000$', '^node:', '^@?\\w', ...]`. For a component library where import order is a team contract, self-documenting config wins.
2. **JSX prop sorting included** — Component libraries have components with 10-15+ props. Alphabetical prop ordering makes APIs scannable. `perfectionist` handles this; `simple-import-sort` cannot.
3. **`import-x/no-cycle`** handles circular dependency detection — the one thing sorting plugins can't do.
4. **`import/no-unresolved`** is redundant — TypeScript catches this at compile time.

**Revision 3 note**: Revision 2 switched to `simple-import-sort` based on peer feedback favoring battle-testedness. After reassessment, `perfectionist` was restored because a UI component library's consistent file structure benefits more from named groups and prop sorting than from zero-config simplicity. For generic web applications, `simple-import-sort` remains an excellent choice.

---

### Plugins EXCLUDED (and why)

#### `eslint-plugin-simple-import-sort` — EXCLUDED (Revision 3)
Two-rule plugin with zero-config defaults. Excellent for generic web applications. For a component library, its regex-based custom groups are harder to read and maintain than `perfectionist`'s named groups, and it lacks JSX prop sorting. If your project is a standard SPA (not a component library), `simple-import-sort` is a strong alternative.

#### `eslint-plugin-unicorn` — EXCLUDED
A grab-bag of "modern JavaScript" rules. Many are useful (`prefer-node-protocol`, `no-array-for-each`), but it's too opinionated as a whole. Rules like `prevent-abbreviations` (flags `props` → wants `properties`) create friction without proportional value. If you want specific unicorn rules, cherry-pick them; don't extend the preset.

#### `eslint-plugin-boundaries` — EXCLUDED (for now)
Enforces architectural boundaries (e.g., "hooks cannot import components"). This is valuable for large design systems with 50+ components and clear layers. The current library has 2 components. Adding boundaries now creates overhead without value. **Revisit when the library reaches 15+ components.**

If you add it later:

```js
{
  plugins: { boundaries },
  settings: {
    'boundaries/elements': [
      { type: 'components', pattern: 'src/components/*' },
      { type: 'hooks', pattern: 'src/hooks/*' },
      { type: 'tokens', pattern: 'src/tokens/*' },
      { type: 'utils', pattern: 'src/utils/*' },
    ],
  },
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'components', allow: ['hooks', 'utils', 'tokens'] },
        { from: 'hooks', allow: ['utils'] },
        { from: 'tokens', allow: [] },
        { from: 'utils', allow: [] },
      ],
    }],
  },
},
```

#### `eslint-plugin-testing-library` — EXCLUDED
The project uses Vitest with Storybook interaction testing, not `@testing-library/react` directly. This plugin would produce false positives.

#### `eslint-plugin-prettier` — EXCLUDED
Runs Prettier inside ESLint. Slower than running them separately. Both the ESLint and Prettier teams recommend against this approach.

#### `tseslint.configs.stylisticTypeChecked` — EXCLUDED (Revision 2)
Stylistic presets change between major versions, causing lint churn and noisy diffs across the entire codebase. Cherry-pick the 2 useful rules (`prefer-optional-chain`, `prefer-nullish-coalescing`) individually instead.

---

## 6. Installation

### New dependencies to install

```bash
cd ux-app

npm install -D \
  eslint-plugin-react \
  eslint-plugin-jsx-a11y \
  eslint-plugin-perfectionist \
  eslint-plugin-import-x \
  eslint-plugin-vitest \
  eslint-config-prettier \
  prettier
```

### Already installed (no action needed)

```
@eslint/js               ^9.39.1
eslint                   ^9.39.1
eslint-plugin-react-hooks ^7.0.1
eslint-plugin-react-refresh ^0.4.24
eslint-plugin-storybook  ^10.2.4
globals                  ^16.5.0
typescript-eslint        ^8.46.4
```

### Verify installation

```bash
npx eslint --version
# Should output: v9.x.x

npx eslint .
# Run linting to verify config works
```

---

## 7. Package.json Scripts & lint-staged

### Scripts

Add these to `ux-app/package.json`:

```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "prepublishOnly": "npm run build",
    "storybook": "storybook dev -p 6006 --no-open",
    "build-storybook": "storybook build",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "lint:styles": "stylelint \"src/**/*.{css,scss}\"",
    "lint:styles:fix": "stylelint \"src/**/*.{css,scss}\" --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "validate": "npm run typecheck && npm run lint && npm run lint:styles && npm run format:check && npm run test"
  }
}
```

**Why `validate`**: A single command that runs the full quality gate. Use in CI: `npm run validate`.

### lint-staged (with Husky)

```bash
npm install -D husky lint-staged
npx husky init
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{scss,css}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

`.husky/pre-commit`:

```sh
npx lint-staged
```

**Why ESLint before Prettier in lint-staged**: ESLint `--fix` may change code structure (e.g., sorting imports). Prettier then normalizes formatting on the ESLint-fixed output. Reversing the order means Prettier's formatting might be undone by ESLint fixes.

---

## 8. Prettier Configuration

### `.prettierrc`

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "bracketSpacing": true,
  "endOfLine": "lf",
  "jsxSingleQuote": false
}
```

| Option | Value | Why |
|--------|-------|-----|
| `singleQuote` | `true` | Industry standard for JS/TS. Reduces shift-key usage. |
| `semi` | `true` | Prevents ASI (Automatic Semicolon Insertion) edge cases. |
| `trailingComma` | `all` | Cleaner git diffs. Adding a new item to a list doesn't change the previous line. |
| `printWidth` | `100` | 80 is too narrow for modern TypeScript with generics. 120 is too wide for side-by-side diffs. 100 is the sweet spot. |
| `tabWidth` | `2` | Standard for JS/TS ecosystem. |
| `arrowParens` | `always` | Consistent: `(x) => x` not `x => x`. Makes adding types easier. |
| `endOfLine` | `lf` | Unix-style line endings. Prevents CRLF/LF inconsistencies in cross-platform teams. |
| `jsxSingleQuote` | `false` | HTML convention uses double quotes for attributes. JSX follows HTML. |

### `.prettierignore`

```
dist
build
coverage
storybook-static
node_modules
*.d.ts
package-lock.json
```

---

## 9. FAQ & Common Objections

### "strictTypeChecked is too noisy. Can we use recommendedTypeChecked?"

You can, but you lose protection against:
- Unnecessary type assertions (`as` casts that are already the correct type)
- Unnecessary conditions (dead `if` branches where the type guarantees truthy/falsy)
- Template literal type safety

For a library, these matter. If the noise is unbearable during initial adoption, start with `recommendedTypeChecked` and upgrade to `strict` within one sprint.

### "Why not stylisticTypeChecked?"

Stylistic presets cause three problems at scale:
1. **Upgrade churn** — New typescript-eslint major versions add/change stylistic rules, breaking CI across hundreds of files.
2. **Noisy diffs** — `eslint --fix` touches files you didn't intend to change, creating merge conflicts.
3. **Team friction** — Stylistic choices (`interface` vs `type`) are subjective; a preset forces one without team consensus.

Cherry-pick the 2 rules with clear correctness value (`prefer-optional-chain`, `prefer-nullish-coalescing`). Skip the rest.

### "Do we need both eslint-plugin-react AND react-hooks?"

Yes. They cover different domains:
- `react-hooks` → Rules of Hooks, exhaustive deps
- `react` → JSX patterns, component lifecycle, security (`target="_blank"`), display names, leaked renders

There is no overlap. Both are needed.

### "Won't import-x/no-cycle slow down linting?"

With `maxDepth: 4` and scoped to `src/**` only, the performance impact is negligible for a library under ~100 components. The rule only traverses 4 hops deep in the import graph, not the full graph.

If lint times grow beyond 10 seconds as the library scales:
1. Reduce `maxDepth` to 3 (catches most real cycles)
2. Move cycle detection to CI using `madge --circular` (purpose-built, faster)
3. Keep the ESLint rule in `lint-staged` only (runs on changed files)

### "Why not put all rules in one big config object?"

Separation by concern (TypeScript, React, Import Sorting, Import Safety, Storybook, Tests) means:
- File-scoped rules via `files` → stories get different rules than library code
- Easier to add/remove layers → adding `eslint-plugin-boundaries` later is a new section, not surgery on an existing block
- Readable → a new team member can find "where are the React rules" instantly

### "Should we use `tseslint.config()` instead of `defineConfig()`?"

Either works. `defineConfig()` is ESLint-native (added in ESLint 9.x). `tseslint.config()` was the community solution before ESLint added native support. We use `defineConfig()` because:
1. It's the standard going forward
2. It doesn't tie the config wrapper to a third-party package
3. ESLint's own documentation uses it

### "Can we add eslint-plugin-boundaries now?"

You can, but with 2 components, the overhead exceeds the value. Add it when:
- The library has 15+ components
- You have distinct layers (components, hooks, utils, tokens)
- You've caught a bug caused by a wrong-direction import

### "The build takes longer now with type-aware linting."

Type-aware linting with `projectService: true` is significantly faster than the old `project` approach. If it's still slow:
1. Ensure `tsconfig.app.json` uses `include: ["src"]` (not `**/*`)
2. Run ESLint only on staged files in pre-commit (lint-staged does this)
3. Run full lint in CI, not on every save

---

## Appendix: Complete Dependency List

### Required (install these)

| Package | Purpose | Version |
|---------|---------|---------|
| `eslint` | Core linter | `^9.39.x` |
| `@eslint/js` | Base JS recommended rules | `^9.39.x` |
| `typescript-eslint` | TS parser + rules | `^8.46.x` |
| `globals` | Global variable definitions | `^16.x` |
| `eslint-plugin-react` | React-specific rules | latest |
| `eslint-plugin-react-hooks` | Hooks rules | `^7.x` |
| `eslint-plugin-react-refresh` | Vite HMR validation | `^0.4.x` |
| `eslint-plugin-jsx-a11y` | JSX accessibility | latest |
| `eslint-plugin-storybook` | Storybook CSF rules | `^10.x` |
| `eslint-plugin-perfectionist` | Import/export/prop sorting | latest |
| `eslint-plugin-import-x` | Circular dependency detection | latest |
| `eslint-plugin-vitest` | Vitest test quality rules | latest |
| `eslint-config-prettier` | Disables formatting rules | latest |
| `prettier` | Code formatter | latest |

### Optional (install when needed)

| Package | Purpose | When |
|---------|---------|------|
| `eslint-plugin-boundaries` | Architecture boundaries | 15+ components |
| `eslint-plugin-simple-import-sort` | Simpler import sorting (no named groups) | If building an SPA, not a component library |
| `husky` | Git hooks | When team size > 1 |
| `lint-staged` | Lint only staged files | With Husky |

---

