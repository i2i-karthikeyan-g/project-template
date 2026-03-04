# Enterprise React Design System UI Library Architecture (Vite + Storybook 10)

## Executive Architecture Overview

This document describes an end‑to‑end architecture for an enterprise React design system UI library built with Vite, Storybook 10+, TypeScript, SCSS, Vitest, and a modern linting/formatting toolchain, published as a private npm package via GitHub Packages or Azure Artifacts and consumed by internal applications.

The library is built as a framework‑agnostic React component package in Vite **library mode** with ESM‑first output, externalized peer dependencies (React, ReactDOM, PrimeReact), and first‑class support for design tokens, theming, and tree‑shakeable entry points. Storybook 10+ with the Vite builder is used for interactive documentation, visual regression hooks, and component‑driven testing, leveraging the Vitest integration where appropriate. CI/CD pipelines in GitHub Actions and Azure DevOps automate linting, testing, versioning (Semantic Versioning with Changesets), publishing, and documentation deployment.[^1][^2][^3][^4][^5][^6][^7][^8][^9]

***

## Folder Structure Justification

Target structure:

```text
ui-library/
  ├─ src/
  │   ├─ components/
  │   │   ├─ Button/
  │   │   │   ├─ Button.tsx
  │   │   │   ├─ button.scss
  │   │   │   ├─ Button.stories.tsx
  │   │   │   ├─ button.types.ts
  │   │   │   ├─ button.utils.ts
  │   │   │   ├─ button.constant.ts
  │   │   │   └─ index.ts
  │   │   └─ ...
  │   ├─ design-tokens/
  │   ├─ hooks/
  │   ├─ utils/
  │   ├─ styles/
  │   └─ index.ts
  ├─ .storybook/
  ├─ vite.config.ts
  ├─ tsconfig.json
  ├─ package.json
  ├─ eslint.config.mjs (flat config)
  ├─ .prettierrc
  ├─ .stylelintrc.cjs
  ├─ postcss.config.cjs
  ├─ .browserslistrc
  └─ ...
```

Key rationale:

- **Component‑scoped directories** (`src/components/Button`) co‑locate implementation, styles, stories, and support files, which promotes discoverability and enforces a one‑component‑per‑folder convention that scales to hundreds of components.
- **`design-tokens`** holds the single source of truth for global tokens (SCSS maps, CSS custom properties, JSON for tooling), enabling consistent theming across React components, Storybook, and host apps.
- **`styles`** stores global styles, reset/normalize, typography, utility classes, and theme entry points, keeping them separate from per‑component SCSS to prevent leakage.
- **`hooks` and `utils`** isolate reusable non‑UI logic, simplifying dependency boundaries and supporting tree‑shaking by exposing only what is exported from `src/index.ts`.
- **`.storybook`** and root configs (`vite.config.ts`, lint/format configs) remain flat to reduce cognitive load; they configure how the library is built, tested, and documented without polluting runtime imports.


***

## Tooling Deep Dive (with Configs)

### Why Vite (vs Rollup standalone, CRA, Next.js)

**Vite vs Rollup standalone**

- Vite internally uses Rollup for production builds but layers a fast dev server with native ESM, optimized HMR, and a simpler config API. For a component library, this means near‑instant dev feedback while still generating highly optimized Rollup bundles for distribution.[^10][^1]
- Using Rollup directly gives maximum control but requires more verbose configuration for dev, testing, and Storybook integration, increasing maintenance overhead for marginal gains in a standard React library scenario.
- Vite’s **library mode** (`build.lib`) is specifically designed for browser‑oriented libraries and exposes the right level of Rollup options without needing a bespoke bundling pipeline.[^1][^10]

**Vite vs Create React App (CRA)**

- CRA targets single‑page applications, not libraries; customizing its Webpack config requires `react-app-rewired` or ejecting, which is brittle and inflexible for library output formats, externalization, and type generation.
- CRA’s future is uncertain compared to the active Vite ecosystem, which has become the default choice for modern React tooling and is continuously updated.[^10]

**Vite vs Next.js**

- Next.js is an application framework optimized for SSR/SSG, routing, and data‑fetching; using it to build a pure UI library couples your design system to a specific app framework and complicates SSR assumptions for consumer apps.
- A standalone library built with Vite is framework‑agnostic and can be consumed by Next, Remix, CRA, Vite apps, and microfrontends without imposing routing or data‑layer opinions.

**Self‑argument:**

- One might argue for **Rollup standalone** plus a minimal dev setup to keep the library closer to raw bundling primitives. This can be appropriate when building isomorphic or non‑browser libraries or when extremely fine‑grained bundle control is required (e.g., custom module federation).
- In an enterprise design system with many contributors and Storybook at the center, the **DX and ecosystem alignment of Vite** outweigh the small overhead of its abstraction over Rollup.


### ESLint (Flat Config, TypeScript, React)

**Why ESLint (flat config)**

- ESLint remains the de‑facto JS/TS linter and its new flat config system simplifies configuration and avoids implicit cascades from `.eslintrc` variants.[^11]
- Using TypeScript‑aware rules (`@typescript-eslint`) and React hooks rules ensures correctness in component logic and hooks usage across the library.

**Key goals:**

- Enforce consistent code style (in complement with Prettier) and catch common bugs.
- Differentiate **library source** from **storybook/test** files to avoid noisy rules.

**`eslint.config.mjs` (flat):**

```js
// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      // Build artifacts, Storybook static output if any
      'storybook-static/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: new URL('.', import.meta.url),
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // React and hooks
      'react/jsx-uses-react': 'off', // React 17+ JSX transform
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // using TS
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Imports
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-default-export': 'off', // allow default for components if desired

      // TypeScript strictness
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // Formatting delegated to Prettier
      ...prettier.rules,
    },
  },
  {
    files: ['**/*.stories.@(ts|tsx)', '**/*.test.@(ts|tsx)', 'src/**/*.stories.@(ts|tsx)'],
    rules: {
      // Example: relax some rules in stories/tests
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-default-export': 'off',
    },
  },
];
```


### Prettier

**Why Prettier**

- Ensures consistent formatting independent of editor settings; minimizes diff noise and enables developers to focus on semantics rather than style debates.
- Integrates with ESLint via `eslint-config-prettier` to let Prettier handle purely stylistic rules.

**`.prettierrc`**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```


### Husky + lint-staged (+ optional commit linting)

**Why Husky & lint-staged**

- Husky adds Git hooks that run locally before commits or pushes, catching issues early and maintaining quality across large teams.[^12]
- `lint-staged` ensures only changed files are linted/formatted, keeping hooks fast even in large repos.
- Optionally combine with **commitlint** and Conventional Commits to improve release automation and changelog quality.

**Install & scripts (excerpt from `package.json`):**

```json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint .",
    "lint:styles": "stylelint \"src/**/*.{css,scss}\"",
    "test": "vitest",
    "format": "prettier --write ."
  },
  "lint-staged": {
    "src/**/*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "src/**/*.{scss,css}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{md,json,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

**`.husky/pre-commit`:**

```sh
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**Optional `.husky/commit-msg` (with @commitlint/config-conventional):**

```sh
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

npx commitlint --edit "$1"
```

This setup enforces code quality at commit time while keeping CI as the final gate.


### Stylelint (SCSS + Design Tokens)

**Why Stylelint**

- Lints CSS/SCSS for common pitfalls (unknown properties, invalid syntax) and enforces naming conventions, token usage, and architecture rules in large design systems.
- With `stylelint-scss` and custom rules, it can enforce that only design tokens (not raw hex values) are used for colors, spacing, and typography.

**`.stylelintrc.cjs`:**

```js
// .stylelintrc.cjs
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-prettier-scss',
  ],
  plugins: ['stylelint-scss'],
  rules: {
    'color-named': 'never',
    'color-no-hex': true,
    'declaration-no-important': true,
    'selector-max-id': 0,
    'selector-class-pattern': [
      '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$',
      {
        message: 'Class names should be kebab-case',
      },
    ],
    'scss/dollar-variable-pattern': [
      '^ds-[a-z0-9-]+$',
      {
        message: 'SCSS variables should be prefixed with $ds-',
      },
    ],
    // Encourage design tokens via CSS variables or SCSS vars
    'declaration-property-value-disallowed-list': {
      '/^color$/': ['/(#|rgb|hsl)/i'],
      '/^background/': ['/(#|rgb|hsl)/i'],
    },
  },
  ignoreFiles: ['dist/**/*', 'storybook-static/**/*'],
};
```


### PostCSS (Autoprefixer, Nesting, Modern CSS)

**Why PostCSS**

- Vite relies on PostCSS under the hood; adding explicit config lets the library use **Autoprefixer** and optional modern CSS features while still honoring Browserslist targets.[^13]

**`postcss.config.cjs`:**

```js
// postcss.config.cjs
module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-nesting': {},
  },
};
```


### Browserslist

**Why Browserslist**

- Central configuration for target browsers used by Autoprefixer and (optionally) by Babel/TypeScript down‑leveling, aligning supported browsers across tools.[^13]

**`.browserslistrc`:**

```text
> 0.5%
last 2 versions
not dead
not ie <= 11
```

This is a reasonable enterprise default; teams can tighten or broaden based on actual customer analytics.


### TypeScript Configuration

**Why TypeScript**

- Provides static typing for components, hooks, design tokens, and utility layers, improving maintainability and API stability for internal consumers.
- Type declarations are critical for libraries; they must be shipped alongside compiled JS.

**`tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "declarationDir": "dist/types",
    "emitDeclarationOnly": false,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "baseUrl": "./src",
    "paths": {
      "@ui-library/*": ["./*"]
    }
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx"]
}
```

For more advanced setups, a separate `tsconfig.build.json` can restrict the declaration build to `src` only while Storybook may use a broader config.


***

## Vite Build Internals (Library Mode)

### Why Library Mode

Vite’s library mode is explicitly intended for bundling libraries rather than applications; it allows specifying an entry file, output formats, and Rollup options while keeping dev experience identical to an app.
This mode automatically configures Rollup to generate bundles for multiple formats and avoids emitting an HTML entry, which is irrelevant for libraries.[^1][^10]

### Bundle formats and tree‑shaking strategy

- Prefer **ESM (ES modules)** as the primary format; it is standard for modern bundlers and enables efficient tree‑shaking in consumer apps.[^10]
- Optionally emit **CJS** for legacy environments or Node‑based tooling (e.g., Jest in older apps), but many modern enterprise stacks are ESM‑ready, so the CJS bundle can be optional.
- Avoid UMD for internal enterprise libraries unless there is a concrete need for script‑tag usage; UMD adds weight and complexity with little value in controlled environments.
- Tree‑shaking is achieved by **pure ESM exports**, clear `sideEffects` metadata in `package.json`, and avoiding top‑level side effects in components.

### Peer dependencies strategy

- Treat `react`, `react-dom`, and `primereact` as **peerDependencies** to avoid bundling them into the library; this prevents multiple React copies and keeps bundle sizes minimal.
- Mark these as `external` in Vite’s `rollupOptions` to ensure Rollup does not bundle them.

### CSS strategy: bundled vs external

- **Bundled CSS in JS** (e.g., CSS‑in‑JS) simplifies consumption (import a component and everything works) but can reduce style override flexibility and complicate SSR.
- **External CSS bundles** (e.g., `dist/style.css`) allow apps to control loading order, optimize caching, and apply global theming, but require explicit inclusion of styles by consumers.
- For this system, a **hybrid** is recommended:
  - Generate a **single global CSS bundle** for base styles and design tokens.
  - Generate **component‑scoped CSS** that can be code‑split by consumer bundlers.

### Vite config with Rollup options

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: [
        '**/*.stories.tsx',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
      outputDir: 'dist/types',
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UiLibrary',
      fileName: (format) => `ui-library.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Do not bundle peer deps
      external: ['react', 'react-dom', 'primereact'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          primereact: 'PrimeReact',
        },
        // Enable better tree-shaking & per-module imports for some setups
        preserveModules: false,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'styles/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    sourcemap: true,
    cssCodeSplit: true,
    minify: 'esbuild',
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Inject global tokens & mixins into every SCSS file
        additionalData: `@use "./src/design-tokens/tokens" as *; @use "./src/styles/mixins" as *;`,
      },
    },
  },
});
```

**Key options explained:**

- `lib.entry` points to `src/index.ts`, the single public entry that re‑exports components, hooks, tokens, and types.
- `formats: ['es', 'cjs']` targets both modern bundlers and any legacy CJS consumers while prioritizing ESM for tree‑shaking.[^10]
- `rollupOptions.external` keeps React and PrimeReact as peer deps and ensures they are not bundled.
- `assetFileNames` places CSS assets in `dist/styles`, making it easy for consumers to reference if needed.
- `cssCodeSplit: true` allows separate CSS chunks per entry; consumer apps can tree‑shake CSS that is not imported.
- `dts` plugin generates `.d.ts` files in `dist/types`, excluding stories and tests, simplifying consumption and IDE experience.[^2][^14]
- `scss.additionalData` injects design tokens and mixins automatically into every SCSS file, avoiding repetitive imports and guaranteeing consistent tokens.

**Preserve modules vs single bundle:**

- `preserveModules: false` produces a smaller number of bundled files and is simpler for most consumers.
- Setting `preserveModules: true` can be beneficial if your consumers import deep paths (`@scope/ui-library/Button`) directly or you want highly granular tree‑shaking, but this may increase the number of emitted files and complicate package exports.[^15]

**Excluding stories/tests from build:**

- The `dts` plugin `exclude` option avoids generating types for stories/tests.
- `tsconfig.json` excludes those files from compilation, and Rollup will not include them if they are not referenced from `src/index.ts`.


***

## Storybook Architecture (10+ with Vite Builder)

### Why Storybook 10+ with Vite builder

- Storybook’s main config now uses `main.ts` with ESM syntax; it integrates seamlessly with Vite and can reuse the existing Vite configuration.[^3][^5][^16]
- The Vite builder provides fast HMR and type‑aware bundling, giving close parity with the library’s runtime environment.[^5]
- Storybook 9+ integrates deeply with Vitest and Playwright for component and interaction testing, consolidating the testing surface around stories.[^4][^6]

### .storybook/main.ts

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import baseViteConfig from '../vite.config';

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(ts|tsx)',
    '../src/hooks/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config, { configType }) => {
    // Merge with base Vite config to reuse aliases, css, plugins
    return mergeConfig(config, {
      ...baseViteConfig,
      build: {
        // Storybook build is separate from library build
        sourcemap: configType === 'DEVELOPMENT',
      },
      css: {
        ...baseViteConfig.css,
      },
    });
  },
};

export default config;
```

### .storybook/preview.ts

```ts
// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import '../src/styles/global.scss';
import { DesignSystemProvider } from '../src/design-tokens/DesignSystemProvider';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#111827' },
      ],
    },
  },
  decorators: [
    (Story, context) => (
      <DesignSystemProvider theme={context.globals.theme || 'light'}>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
};

export default preview;
```

This setup ensures:

- **Docs mode** via `@storybook/addon-docs` and autodocs tags.
- **Controls** and **actions** configured for arg‑driven stories.
- **Global decorators** wrapping every story with a `DesignSystemProvider` that injects design tokens and themes.
- Easy alignment between file system structure and Storybook’s story indexing.

### Storybook testing vs Vitest

**Storybook Test (Vitest‑powered):**

- Pros:
  - Uses existing stories as test cases (no duplication of component scenarios).[^17][^6][^4]
  - Supports interaction tests with `play` functions and visual checks via Chromatic or Playwright.
  - Provides a unified UI for exploring failures and debugging interactions.
- Cons:
  - Tight coupling to Storybook; cannot run easily in environments without a browser unless configured to use Vitest CLI only.[^4]
  - Stories must be kept “test‑friendly” and deterministic; over‑mocking or heavy decorators can introduce flakes.

**Vitest standalone:**

- Pros:
  - Fast CLI test runner optimized for Vite projects; integrates well with IDEs.[^4]
  - Better suited for **logic‑heavy hooks and utilities** that do not require visual inspection.
  - No dependency on Storybook runtime; simpler CI integration when only unit tests are needed.
- Cons:
  - Requires writing test‑specific render setups separate from stories (although you can import stories or underlying components).

**Recommendation:**

- Use **Vitest** for unit tests of hooks, utilities, and components where pure logic dominates.
- Use **Storybook Test** (Vitest‑backed) for interaction tests and component behavior validated via stories.
- Optionally use **Playwright** for cross‑browser regression on a small set of critical flows.


***

## Testing Architecture

### Vitest configuration

**`vitest.config.ts`:**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.@(ts|tsx)'],
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.@(ts|tsx)',
        'src/**/index.ts',
        'src/design-tokens/**',
      ],
    },
    alias: {
      '@ui-library': resolve(__dirname, 'src'),
    },
  },
});
```

**`vitest.setup.ts`:**

```ts
import '@testing-library/jest-dom/vitest';

// Optionally, global mocks (e.g., ResizeObserver) can be defined here
```

This configuration uses jsdom for DOM APIs, sets up Testing Library matchers, and scopes coverage to library source files while excluding stories.

### Component testing vs unit testing

- **Unit tests (Vitest)** validate isolated logic: hooks (`useDebounce`), util functions, and component behavior with minimal DOM assertions.
- **Component tests (Storybook + Vitest/Playwright)** validate UI states, interactions, and integration with design tokens, verifying that theme changes and responsive behavior function as documented.[^17][^4]

### Playwright (optional)

- Playwright is suited for **end‑to‑end** or high‑fidelity **visual regression** tests, either against the Storybook instance or a reference app.[^6]
- Recommended for a curated set of golden paths (core layout, typography) rather than every component due to maintenance cost.


***

## SCSS Architecture and Design Tokens

### Global tokens and variables

Design tokens should be stored once and emitted in several formats:

- SCSS maps and variables for internal component styles.
- CSS custom properties for runtime theming and host app overrides.
- Optionally JSON for design tools and external automation.

**Example: `src/design-tokens/_tokens.scss`:**

```scss
// src/design-tokens/_tokens.scss

$ds-color-primary: #2563eb;
$ds-color-primary-hover: #1d4ed8;
$ds-color-primary-contrast: #ffffff;

$ds-spacing-1: 0.25rem;
$ds-spacing-2: 0.5rem;
$ds-spacing-3: 0.75rem;
$ds-spacing-4: 1rem;

$ds-radius-sm: 0.25rem;
$ds-radius-md: 0.375rem;
$ds-radius-lg: 0.5rem;

:root {
  --ds-color-primary: #2563eb;
  --ds-color-primary-hover: #1d4ed8;
  --ds-color-primary-contrast: #ffffff;

  --ds-spacing-1: 0.25rem;
  --ds-spacing-2: 0.5rem;
  --ds-spacing-3: 0.75rem;
  --ds-spacing-4: 1rem;

  --ds-radius-sm: 0.25rem;
  --ds-radius-md: 0.375rem;
  --ds-radius-lg: 0.5rem;
}

[data-theme='dark'] {
  --ds-color-primary: #60a5fa;
  --ds-color-primary-hover: #3b82f6;
  --ds-color-primary-contrast: #020617;
}
```

### Global vs component SCSS

- **Global SCSS** (`src/styles/global.scss`) provides resets, typography, and utility classes and imports tokens.
- **Component SCSS** (`Button/button.scss`) defines only component‑specific rules using design tokens and avoids global leaks (e.g., BEM or locally‑scoped class names).

**`src/styles/global.scss`:**

```scss
@use '../design-tokens/tokens';

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--ds-color-text, #111827);
  background-color: var(--ds-color-background, #f9fafb);
}

.ds-visually-hidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}
```

**`src/components/Button/button.scss`:**

```scss
@use '../../design-tokens/tokens';

.ds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-spacing-2);
  padding: var(--ds-spacing-2) var(--ds-spacing-4);
  border-radius: var(--ds-radius-md);
  border: 1px solid transparent;
  background-color: var(--ds-color-primary);
  color: var(--ds-color-primary-contrast);
  cursor: pointer;
  transition: background-color 150ms ease, transform 50ms ease;

  &:hover {
    background-color: var(--ds-color-primary-hover);
  }

  &:active {
    transform: translateY(1px);
  }

  &--secondary {
    background-color: transparent;
    color: var(--ds-color-primary);
    border-color: var(--ds-color-primary);
  }

  &--disabled,
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

### CSS Modules vs global SCSS

- **CSS Modules** provide automatic local scoping and avoid class name collisions but can be inconvenient for design systems where consumers want to target specific class hooks (e.g., `.ds-button`).
- **Global SCSS with a strict naming convention** (`ds-` prefix) is generally better for libraries, as it exposes stable hooks for host app overrides while still avoiding collisions via prefixing and Stylelint rules.

### Theming and dark mode strategy

- Use a `DesignSystemProvider` React context that toggles a `data-theme` attribute on a root element and syncs with CSS variables defined in `_tokens.scss`.
- Components consume tokens via CSS variables so theme changes propagate automatically without re‑compiling SCSS.

**`DesignSystemProvider.tsx` (simplified):**

```tsx
import { ReactNode, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface Props {
  theme?: Theme;
  children: ReactNode;
}

export const DesignSystemProvider = ({ theme = 'light', children }: Props) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
};
```

### PrimeReact wrapping strategy

Some complex components are implemented using PrimeReact internally but exposed via your own API:

- Keep `primereact` as a peer dependency and mark it external in Vite.
- Wrap PrimeReact components and adapt props to your design system types.
- Use your SCSS tokens to override PrimeReact styles via class names and CSS variables.

**Example: `src/components/Dropdown/Dropdown.tsx`:**

```tsx
import { Dropdown as PrimeDropdown, DropdownProps as PrimeDropdownProps } from 'primereact/dropdown';
import './dropdown.scss';

export interface DsDropdownOption {
  label: string;
  value: string | number;
}

export interface DropdownProps {
  options: DsDropdownOption[];
  value?: string | number;
  onChange?: (value: string | number | null) => void;
  disabled?: boolean;
}

export const Dropdown = ({ options, value, onChange, disabled }: DropdownProps) => {
  const primeOptions = options.map((o) => ({ label: o.label, value: o.value }));

  const handleChange: PrimeDropdownProps['onChange'] = (e) => {
    onChange?.(e.value ?? null);
  };

  return (
    <PrimeDropdown
      className="ds-dropdown"
      options={primeOptions}
      value={value}
      onChange={handleChange}
      disabled={disabled}
    />
  );
};
```

This approach isolates PrimeReact behind a stable internal API and styling contract while allowing you to upgrade or replace PrimeReact without breaking consumer code.


***

## Package.json Best Practices

**Key fields and rationale:**

```json
{
  "name": "@your-scope/ui-library",
  "version": "0.1.0",
  "main": "dist/ui-library.cjs.js",
  "module": "dist/ui-library.es.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/ui-library.es.js",
      "require": "./dist/ui-library.cjs.js",
      "types": "./dist/types/index.d.ts"
    },
    "./button": {
      "import": "./dist/components/Button/index.js",
      "types": "./dist/types/components/Button/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "sideEffects": [
    "dist/styles/*.css"
  ],
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "primereact": "^10.0.0"
  },
  "devDependencies": {
    // ... tooling and build deps
  },
  "publishConfig": {
    "access": "restricted"
  },
  "engines": {
    "node": ">=18",
    "npm": ">=9"
  }
}
```

- `main`/`module`/`exports` provide clear ESM/CJS entry points and are used by Node and bundlers for optimal resolution.[^10]
- `types` points to the bundled type declarations for IDEs.
- `exports` allows sub‑path exports (e.g., `@your-scope/ui-library/button`), enabling granular imports without exposing the entire file structure.
- `files` ensures only built artifacts and essential docs are published, not tests or config files.
- `sideEffects` is set to only CSS files that should not be tree‑shaken; everything else is considered pure.
- `peerDependencies` prevents multiple React/PrimeReact copies across apps.
- `publishConfig.access: 'restricted'` is used with private registries to keep the package private.
- `engines` communicates runtime expectations to consumers and CI.

**Scoped package vs internal registry:**

- **Scoped package** (`@org/ui-library`) is recommended even in private registries; scopes integrate well with npm/Yarn/PNPM and simplify registry routing via `.npmrc`.[^18][^19]
- An **internal registry** (Azure Artifacts or GitHub Packages) is required for truly private hosting; the scope simply points packages to the correct registry via configuration.

**Monorepo vs single package:**

- Start with a **single package** if only one library is being produced; this reduces complexity and onboarding friction.
- When expanding to multiple packages (tokens, icons, React, Angular, etc.), move to a **monorepo** using pnpm/yarn workspaces and Changesets for cross‑package version management.[^7][^8][^9]


***

## Private Hosting Strategy Comparison

### GitHub and Azure options

**GitHub options:**

- **GitHub Packages (npm registry):** Host private scoped packages at `https://npm.pkg.github.com` with standard npm semantics and granular access via org/repo permissions.[^20][^21][^12]
- **GitHub Releases tarball:** Distribute built artifacts as `.tgz` in Releases; consumers reference a tarball URL in `package.json`. Simple but lacks semantic version discovery and tooling integration.
- **GitHub repository as dependency (`git+ssh`):** Consumers install directly from Git tags or branches, which bypasses registries but sacrifices caching, semver resolution, and security scanning.

**Azure options:**

- **Azure Artifacts npm feed:** Full‑featured private npm feed integrated with Azure DevOps, supporting scoped packages and granular permissions.[^22][^19]
- **Azure DevOps pipelines:** Build and publish the library to Artifacts with tasks like `npmAuthenticate@0` to manage `.npmrc` and credentials automatically.[^23][^22]

**Hybrid (Azure + GitHub):**

- Keep source code and CI in GitHub, publish packages to **Azure Artifacts** used by broader enterprise systems, or vice versa.
- This allows leveraging GitHub’s developer‑centric workflows while integrating with Azure’s enterprise governance and auditing.[^19][^22]

### .npmrc examples

**GitHub Packages (scoped):**[^21][^20][^12]

```text
@your-scope:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
always-auth=true
```

**Azure Artifacts (organization‑scoped feed):**[^22][^19]

```text
registry=https://pkgs.dev.azure.com/<ORG_NAME>/_packaging/<FEED_NAME>/npm/registry/

always-auth=true

; begin auth token
//pkgs.dev.azure.com/<ORG_NAME>/_packaging/<FEED_NAME>/npm/registry/:username=<USERNAME>
//pkgs.dev.azure.com/<ORG_NAME>/_packaging/<FEED_NAME>/npm/registry/:_password=<BASE64_ENCODED_PAT>
//pkgs.dev.azure.com/<ORG_NAME>/_packaging/<FEED_NAME>/npm/registry/:email=npm@example.com
; end auth token
```

**Scoped Azure feed with `@your-scope`:**

```text
@your-scope:registry=https://pkgs.dev.azure.com/<ORG_NAME>/_packaging/<FEED_NAME>/npm/registry/
//pkgs.dev.azure.com/<ORG_NAME>/_packaging/<FEED_NAME>/npm/registry/:username=<USERNAME>
//pkgs.dev.azure.com/<ORG_NAME>/_packaging/<FEED_NAME>/npm/registry/:_password=<BASE64_ENCODED_PAT>
```

### publishConfig examples

**GitHub Packages:**[^12][^21]

```json
{
  "name": "@your-scope/ui-library",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```

**Azure Artifacts:**[^19]

```json
{
  "name": "@your-scope/ui-library",
  "publishConfig": {
    "registry": "https://pkgs.dev.azure.com/<ORG_NAME>/_packaging/<FEED_NAME>/npm/registry/",
    "access": "restricted"
  }
}
```

### CI YAML examples

**GitHub Actions (publish to GitHub Packages):**[^21][^11]

```yaml
name: Publish UI Library

on:
  push:
    branches:
      - main

jobs:
  build-and-publish:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          registry-url: 'https://npm.pkg.github.com/'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint && npm run lint:styles

      - name: Test
        run: npm test -- --runInBand

      - name: Build
        run: npm run build

      - name: Publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm publish
```

**GitHub Actions + Changesets (recommended workflow):**[^8][^9][^7]

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          registry-url: 'https://npm.pkg.github.com/'

      - run: npm ci

      - run: npm run build

      - name: Create version and publish
        uses: changesets/action@v1
        with:
          publish: 'npm publish'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Azure Pipelines (publish to Azure Artifacts):**[^23][^22][^19]

```yaml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'

  - task: NpmAuthenticate@0
    inputs:
      workingFile: .npmrc

  - script: |
      npm ci
    displayName: 'Install dependencies'

  - script: |
      npm run lint
      npm run lint:styles
      npm test
    displayName: 'Lint and test'

  - script: |
      npm run build
    displayName: 'Build library'

  - script: |
      npm publish
    displayName: 'Publish to Azure Artifacts'
```

### Private Hosting Strategy Comparison Table

| Option                        | Security & Access Control                                      | Cost & Limits                               | CI Integration                             | Developer Experience                                           |
|-------------------------------|----------------------------------------------------------------|---------------------------------------------|--------------------------------------------|----------------------------------------------------------------|
| GitHub Packages (npm)        | Org/repo‑level permissions, PAT/GITHUB_TOKEN auth.[^20][^12][^21]       | Included with GitHub plans; storage limits apply.[^12] | First‑class via `actions/setup-node`.[^21][^11] | Excellent for GitHub‑centric teams; simple `.npmrc` & workflows. |
| GitHub Releases tarball      | Same as repo; manual download or URL access.                  | Free but manual maintenance.                | Custom scripts required.                   | Poor semver tooling; harder to update dependencies.            |
| Git `git+ssh` dependency     | SSH keys; repo access controls.                               | No registry cost.                           | No package registry; Git checkout only.    | Inefficient caching; versioning by tags only.                  |
| Azure Artifacts npm          | Fine‑grained feed permissions, PAT auth, org/project scoping.[^22][^23][^19] | Paid tiers with generous limits in Azure DevOps. | Dedicated tasks (`NpmAuthenticate` etc.).[^22][^19] | Strong for enterprises on Azure; slightly heavier setup.        |
| Hybrid (GitHub + Azure)      | Combined GitHub and Azure security models.                    | Depends on usage of both platforms.         | Coordination needed across systems.        | Flexible but more complex; good when teams span ecosystems.    |


***

## CI/CD Implementation and Versioning Strategy

### Dev workflow

1. Developer creates a feature branch off `main`.
2. Implements components, SCSS, stories, and tests following the component folder structure.
3. Runs `npm run lint`, `npm run lint:styles`, and `npm test` locally; Husky + lint‑staged enforce checks on staged files.
4. Creates a **changeset** describing version impact (`patch`, `minor`, `major`) with the CLI (e.g., `npx changeset`).[^9][^7][^8]
5. Opens a pull request; GitHub Actions or Azure Pipelines run full CI.

### Pull request checks

- Lint (ESLint + Stylelint) and Prettier formatting.
- Unit tests (Vitest) with coverage thresholds.
- Storybook build (optional) to ensure docs still build.

### Version bump and publishing strategy

- Use **Semantic Versioning** (SemVer) enforced via Changesets.[^7][^8][^9]
- On merge to `main`, a **Release** workflow:
  - Runs `changeset version` to bump versions and update changelog files.
  - Commits version bumps and changelogs.
  - Runs the build, then `changeset publish` or `npm publish` to push to the configured registry.
  - Creates a Git tag and GitHub Release (optional) for traceability.

### Internal consumption

- Apps add a dependency: `"@your-scope/ui-library": "^0.2.0"`.
- `.npmrc` in apps must point `@your-scope` to the correct registry with a valid token (GitHub or Azure).
- CI pipelines for apps must include appropriate `npmAuthenticate` or `setup-node` configuration to install from the private registry.[^20][^22][^21][^19]

### Rollback strategy

- In case of a breaking regression:
  - Use `npm dist-tag` or registry UI to **deprecate** the bad version.
  - Release a patched version (e.g., 0.2.1) via another changeset.
  - Consumer apps can pin to a known good version if necessary.
- Because the library is consumed via SemVer ranges, restricting the bad version and publishing a fix ensures most apps pick up the corrected version automatically on next install.


***

## Tradeoffs & Enterprise Scalability Analysis

### Vite vs Rollup / CRA / Next

- **Gain:** Modern, fast dev server; library mode; easy Storybook integration; aligned with ecosystem.
- **Lose:** Slightly less low‑level control than bare Rollup; small learning curve for teams used to Webpack.
- **Scaling limits:** Handle very large codebases well; Vite plugins and configs must be curated to avoid slow startup.
- **Risk:** Future breaking Vite changes require maintenance, but the ecosystem support is strong.[^1][^10]

### ESM‑first bundle formats

- **Gain:** Best tree‑shaking and interop with modern bundlers; simpler for host apps targeting modern browsers.
- **Lose:** Some older tooling may still expect CJS; mitigated by providing CJS secondary entry.
- **Scaling limits:** None significant; ESM scales well across many packages.
- **Risk:** Node ESM/CJS interop can be subtle, but library export patterns and tests mitigate it.[^10]

### Peer dependencies and externalization

- **Gain:** Avoid duplicated React/PrimeReact across apps; smaller bundle sizes; clearer ownership of runtime deps.
- **Lose:** Consumers must manage compatible versions; misalignment can cause runtime errors.
- **Scaling limits:** Many peer deps can increase cognitive load; document clearly supported versions.
- **Risk:** If peer constraints are too loose, subtle behavior differences may appear.

### Scoped package + private registry

- **Gain:** Simple isolation of enterprise packages, easy redirection via `.npmrc`, and clear security boundaries.[^18][^19]
- **Lose:** Requires registry infrastructure and auth management; some developers may struggle with tokens.
- **Scaling limits:** Registry limits (storage, bandwidth) and organizational governance must be managed.
- **Risk:** Misconfigured `.npmrc` can leak tokens if committed accidentally; enforce secrets policies.

### Single package vs monorepo

- **Gain (single):** Minimal overhead, easy onboarding, simple publishing.
- **Lose:** Less modularity; harder to separate tokens, icons, adapters as separate packages later.
- **Scaling limits:** As the design system grows, splitting into multiple type‑specific packages often becomes necessary.
- **Risk:** Migration to monorepo later can be disruptive if not planned.

### Testing stack (Vitest + Storybook + optional Playwright)

- **Gain:** Comprehensive coverage from unit tests to visual and interaction tests.[^6][^17][^4]
- **Lose:** Complexity of multiple testing layers; must maintain clear boundaries.
- **Scaling limits:** Thousands of stories can slow Storybook CI; use selective visual testing and smart test selection.
- **Risk:** Over‑reliance on one type of test (e.g., only interaction tests) may miss edge cases; maintain a balanced suite.


***

## Step‑by‑Step Implementation Roadmap (with Code Pointers)

1. **Initialize project**
   - `npm init -y`
   - Install build/test/dev dependencies:
     - `npm install react react-dom primereact`
     - `npm install -D typescript vite @vitejs/plugin-react-swc vite-plugin-dts`
     - `npm install -D vitest @testing-library/react @testing-library/jest-dom`
     - `npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-import eslint-config-prettier`
     - `npm install -D prettier`
     - `npm install -D stylelint stylelint-scss stylelint-config-standard stylelint-config-standard-scss stylelint-config-prettier-scss`
     - `npm install -D postcss autoprefixer postcss-nesting`
     - `npm install -D husky lint-staged`
     - `npm install -D @storybook/react-vite @storybook/addon-essentials @storybook/addon-a11y @storybook/addon-interactions @storybook/addon-docs`

2. **Create folder structure**
   - Create `src/components/Button/` with `Button.tsx`, `button.scss`, `Button.stories.tsx`, `button.types.ts`, `button.utils.ts`, `button.constant.ts`, `index.ts`.
   - Create `src/design-tokens/`, `src/styles/`, `src/hooks/`, `src/utils/`, `src/index.ts`.

3. **Implement design tokens and SCSS base**
   - Add `_tokens.scss` and `global.scss` as shown.
   - Configure `vite.config.ts` `css.preprocessorOptions.scss.additionalData` to auto‑inject tokens and mixins.

4. **Implement initial components**
   - Example `Button.tsx`:

```tsx
// src/components/Button/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './button.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

export const Button = ({ variant = 'primary', children, className = '', ...rest }: ButtonProps) => {
  const classes = ['ds-button', `ds-button--${variant}`, className].filter(Boolean).join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};
```

   - `Button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Button',
  },
};

export default meta;

export const Primary: StoryObj<typeof Button> = {
  args: {
    variant: 'primary',
  },
};

export const Secondary: StoryObj<typeof Button> = {
  args: {
    variant: 'secondary',
  },
};
```

5. **Configure Vite, TypeScript, ESLint, Prettier, Stylelint, PostCSS, Browserslist**
   - Add `vite.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`, `.stylelintrc.cjs`, `postcss.config.cjs`, `.browserslistrc` as shown earlier.

6. **Set up Storybook**
   - Run `npx storybook@latest init --builder @storybook/react-vite` (or similar) and adjust `.storybook/main.ts` and `.storybook/preview.ts` to match the architecture.[^16][^5]

7. **Set up Vitest and tests**
   - Add `vitest.config.ts` and `vitest.setup.ts`.
   - Create initial tests for `Button` and basic hooks.

8. **Configure Husky and lint-staged**
   - `npx husky install` and add `"prepare": "husky install"` to `package.json`.
   - Add `.husky/pre-commit` and optional `.husky/commit-msg`.

9. **Configure Changesets (optional but recommended)**
   - `npx changeset init` and configure `.changeset/config.json` for single‑package or future monorepo.[^8][^9][^7]

10. **Set up private registry and CI/CD**
    - Decide on GitHub Packages vs Azure Artifacts based on org context.
    - Add `.npmrc` in the library and consuming apps to point `@your-scope` to the right registry.
    - Implement GitHub Actions or Azure Pipelines as shown to automate lint, test, build, and publish.

11. **Document usage and governance**
    - Use Storybook docs for usage examples, theming guides, and migration notes.
    - Establish contribution guidelines, review checklists, and deprecation policies for components.


***

## Additional Considerations for Library Development

- **Accessibility:** Build a11y into components from the start and use Storybook’s a11y addon to run automated checks on every story.[^3][^5]
- **Deprecation strategy:** Use console warnings and documentation badges in Storybook to mark deprecated components before removal.
- **Design‑dev collaboration:** Export tokens in JSON for design tools, and consider integrating tools like Style Dictionary in the future for multi‑platform tokens.
- **Documentation hosting:** Host Storybook static builds on internal infrastructure or GitHub Pages (if allowed) for easy discovery by consumers.
- **Observability:** Instrument components with minimal logging in dev builds (feature flags) and provide guidelines for error boundaries in consuming apps.

This architecture yields a scalable, opinionated yet flexible React design system library that can evolve into a multi‑package platform over time while remaining consumable via a single private npm dependency today.

---

## References

1. [Building for Production - Vite](https://vite.dev/guide/build) - Library mode includes a simple and opinionated configuration for browser-oriented and JS framework l...

2. [Create a Component Library Fast  (using Vite's library mode) - Dev.to](https://dev.to/receter/how-to-create-a-react-component-library-using-vites-library-mode-4lma) - This post covers setting up and publishing a React component library, including configuring your bui...

3. [Main configuration | Storybook docs](https://storybook.js.org/docs/api/main-config/main-config) - The main configuration defines a Storybook project's behavior, including the location of stories, ad...

4. [Component Test with Storybook and Vitest - JS.ORG](https://storybook.js.org/blog/component-test-with-storybook-and-vitest/) - Vitest's test runner powers Storybook Test in our sidebar and enables you to run in the CLI/CI witho...

5. [Vite | Storybook docs - JS.ORG](https://storybook.js.org/docs/builders/vite) - Storybook's Vite builder includes a set of configuration defaults for the supported frameworks, whic...

6. [Storybook 9 - JS.ORG](https://storybook.js.org/blog/storybook-9/) - In Storybook 9, we teamed up with Vitest, the ecosystem's fastest test runner, to create a superior ...

7. [Changesets for Versioning | Vercel Academy](https://vercel.com/academy/production-monorepos/changesets-versioning) - Set up Changesets to manage package versions and changelogs automatically. Fast track. Install @chan...

8. [GitHub - changesets/changesets: A way to manage your versioning ...](https://github.com/changesets/changesets) - The changesets workflow is designed to help when people are making changes, all the way through to p...

9. [Frontend Handbook | Changesets](https://infinum.com/handbook/frontend/changesets) - Changesets is a lightweight tool that helps you manage versions and generate changelogs for packages...

10. [Building for Production - Vite](https://v3.vitejs.dev/guide/build) - Simply run the vite build command. By default, it uses <root>/index.html as the build entry point, a...

11. [Publishing Node.js packages - GitHub Docs](https://docs.github.com/actions/publishing-packages/publishing-nodejs-packages) - When a local .npmrc file exists and has a registry value specified, the npm publish command uses the...

12. [GitHub Packages - NPM Registry - Nathan Nellans](https://www.nathannellans.com/post/github-packages-npm-registry) - This registry allows you to publish NPM packages either to your personal GitHub Account or to a GitH...

13. [Build Options - Vite](https://vite.dev/config/build-options) - This option allows users to set a different browser target for CSS minification from the one used fo...

14. [How do I add types to a Vite library build? - Stack Overflow](https://stackoverflow.com/questions/71982849/how-do-i-add-types-to-a-vite-library-build) - I followed the vite documentation for using library mode and I am able to produce a working componen...

15. [Build a JavaScript library with multiple entry points using Vite3](https://raulmelo.me/en/blog/build-javascript-library-with-multiple-entry-points-using-vite-3) - In this post, I'll show how you can create a lib with multiple entry points (sub-modules) using Vite...

16. [TypeScript | Storybook docs - JS.ORG](https://storybook.js.org/docs/configure/integration/typescript) - Storybook's configuration file (i.e., main.ts ) is defined as an ESM module written in TypeScript, p...

17. [Testing design systems in 2025 - Reshaped](https://reshaped.so/blog/testing-design-systems) - With the Storybook — Vitest integration and turning stories into a complete test suite, there are a ...

18. [Configure npm registry settings - GitHub Gist](https://gist.github.com/robingenz/97f5d6ead665aaaac4024a95f2db9207) - Read on to learn how to configure npm globally and at project level to retrieve npm packages via oth...

19. [Use npm scopes - Azure Artifacts | Microsoft Learn](https://learn.microsoft.com/en-us/azure/devops/artifacts/npm/scopes?view=azure-devops) - By using scopes, you have the ability to segregate public and private packages by adding the scope p...

20. [Working with the npm registry - GitHub Enterprise Server 3.14 Docs](https://docs.github.com/en/enterprise-server@3.14/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) - You can authenticate to GitHub Packages with npm by either editing your per-user ~/.npmrc file to in...

21. [Publish NPM Package to GitHub Packages Registry with GitHub ...](https://www.neteye-blog.com/2024/09/publish-npm-package-to-github-packages-registry-with-github-actions/) - Step 1: Set up the .npmrc file for authentication ... When publishing packages to npm.pkg.github.com...

22. [Accessing Azure Artifacts NPM feed from the docker build](https://dev.to/marcinlovescode/accessing-azure-artifacts-npm-feed-from-the-docker-build-4bem) - It rewrites the whole .npmrc file, and puts credentials into it! To make the docker build work, the ...

23. [Azure Artifacts Private npm Feed Authentication Failed](https://stackoverflow.com/questions/59752277/azure-artifacts-private-npm-feed-authentication-failed) - It appears that the structure of the authentication token which we put in the global .npmrc file has...

