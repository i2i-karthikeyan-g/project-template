# React Design System UI Library Blueprint (Enterprise, 2026)

## Executive Architecture Overview

This document defines an enterprise-grade architecture for a private React Design System library using:

- React (latest stable line in 2026, currently React 19 family)
- Vite (latest stable line in 2026)
- Storybook 10+ (Vite builder)
- TypeScript
- SCSS
- Vitest
- ESLint (flat config)
- Prettier
- Husky + lint-staged + commitlint
- Stylelint
- PostCSS
- Browserslist
- Azure DevOps + GitHub
- Private npm package hosting

The objective is a reusable UI platform that is:

- Fast in local development
- Strict in quality gates
- Safe for internal distribution
- Scalable in component count and contributor count
- Compatible across multiple consuming applications

---

## 1) Architecture-Level Deep Research

### Why Vite over standalone Rollup?

**Argument for Vite**

- Uses esbuild for dev pre-bundling and native ESM during development, producing dramatically faster startup/HMR than pure Rollup dev workflows.
- Provides one toolchain for both:
  - fast app-like local dev/testing DX, and
  - production library bundling (internally powered by Rollup).
- Plugin ecosystem is strong and modern for React + TS + CSS pipelines.

**Counterargument (Rollup standalone)**

- Pure Rollup can feel more explicit and minimal for library-only bundling.
- In very specialized output pipelines, direct Rollup config can be clearer.

**Rebuttal**

- You still get full Rollup control through `build.rollupOptions` in Vite.
- For enterprise teams, standardized developer experience matters more than shaving one config abstraction layer.

**Conclusion**

- Prefer Vite unless you have highly specialized legacy output constraints that Vite cannot express (rare in 2026).

### Why Library Mode?

- Purpose-built for package output instead of application deployment.
- Enables multiple outputs (`es`, optional `cjs`) and controlled externals.
- Preserves consumer bundler optimization (tree shaking).
- Clean separation between source and distributable artifacts.

### Why not CRA?

- CRA is not aligned with modern library workflows and lacks current ecosystem velocity for advanced library packaging.
- Slow compared to Vite.
- Less flexible for modern ESM-first package strategies.

### Why not Next.js?

- Next.js is an app framework (routing, SSR, RSC, deployment model), not a library build system.
- Adds unnecessary complexity and runtime assumptions for a UI package.
- Good for demo/documentation sites, not for package compilation itself.

### Bundle format strategy (ESM, CJS, UMD)

**Recommended default (2026 enterprise internal):**

- Primary: `ESM`
- Secondary (optional): `CJS` only if legacy Node/CommonJS consumers still exist
- Avoid `UMD` unless you explicitly support script-tag CDN usage

**Tradeoffs**

- ESM only:
  - Gain: smallest maintenance surface, future-proof, best tree-shaking
  - Lose: some old tooling compatibility
- ESM + CJS:
  - Gain: maximal compatibility
  - Lose: larger build/test matrix and package complexity
- UMD:
  - Gain: browser global usage
  - Lose: mostly unnecessary for internal npm installs

### Tree-shaking strategy

- ESM exports only (or ESM-first).
- Named exports per component and subpath exports (`@scope/ui-library/button`).
- Mark package `sideEffects` carefully:
  - If global CSS has side effects, include CSS globs in `sideEffects`.
  - Keep JS modules side-effect-free.
- Externalize peers (`react`, `react-dom`, `primereact`) to avoid duplicate frameworks and reduce bundle size.

### CSS in JS bundle vs external CSS

**Option A: CSS bundled into JS**

- Gain: one import path for consumers, simpler setup.
- Lose: runtime style injection overhead, less cache granularity, harder SSR fine control.

**Option B: External CSS (recommended)**

- Gain: browser-level caching, explicit control, fewer runtime side effects.
- Lose: consumers must import stylesheet explicitly (or via package root once).

**Enterprise recommendation**

- Ship external CSS (`dist/style.css`) plus optional per-component CSS if you choose preserveModules.
- Document one required import in consumer app entry:
  - `import '@scope/ui-library/style.css';`

### Peer dependencies strategy

Use `peerDependencies` for runtime frameworks shared with host apps:

- `react`
- `react-dom`
- `primereact` (if wrappers depend on it)

Why:

- Avoid duplicates, version conflicts, and React hook context issues.
- Keep package lean.

Use `devDependencies` for build/test toolchain only.

### Scoped package vs internal registry

**Scoped package (`@company/ui-library`)**

- Strongly recommended for namespace ownership, discoverability, and policy governance.

**Registry**

- GitHub Packages npm or Azure Artifacts feed for private distribution.

### Monorepo vs single package

**Single package (your current ask)**

- Gain: simpler governance, faster setup.
- Lose: harder long-term scaling for many independent packages/icons/tokens/docs tooling.

**Monorepo**

- Gain: shared tooling, coordinated changes, multiple packages (tokens, icons, hooks, components).
- Lose: initial complexity in workspace, release orchestration.

**Recommendation**

- Start single package if team/component count is moderate.
- Define migration path to monorepo once:
  - multiple DS packages emerge, or
  - release cadence diverges.

### Versioning strategy (SemVer + Changesets)

Use SemVer + Changesets:

- Patch: bugfix, no API break.
- Minor: additive backward-compatible features.
- Major: breaking API/visual behavior.

Why Changesets:

- PR-based change intent
- automated changelog generation
- consistent release notes
- supports both GitHub Actions and Azure pipelines

### Performance implications

- Vite dev speed reduces team cycle time.
- Externalized peers reduce library artifact size.
- ESM + sideEffects tuning improves consumer tree-shaking.
- Storybook with docs and interaction tests improves confidence without shipping test code.

---

## 2) Folder Structure Justification

Target structure (as requested) is valid and enterprise-friendly:

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
 ├─ eslint.config.js
 ├─ .prettierrc
 ├─ .stylelintrc.cjs
 ├─ postcss.config.cjs
 ├─ .browserslistrc
 └─ ...
```

### Why this structure scales

- Co-locates component logic, styles, stories, and local types/utilities for maintainability.
- Keeps design tokens centralized and separately evolvable.
- Keeps app-level style primitives in `src/styles`.
- Supports per-component ownership and easier code review boundaries.

### Add these practical conventions

- Keep test files next to components (`*.test.tsx`) but exclude from publish output.
- Keep index barrels minimal to avoid accidental export bloat.
- Maintain strict public API in root `src/index.ts`.

---

## 3) Vite Build Internals (Deep Dive + Full Config)

### Build goals

- Library mode output
- External peer deps
- Typed output (`.d.ts`)
- SCSS + PostCSS pipeline
- Exclude stories/tests from build
- Allow either bundled file or preserveModules strategy

### Recommended `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

const entry = resolve(__dirname, 'src/index.ts');

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      dts({
        include: ['src'],
        exclude: [
          '**/*.stories.ts',
          '**/*.stories.tsx',
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/__tests__/**',
          '.storybook/**',
          'src/**/*.mdx'
        ],
        // Keep declaration output aligned with dist structure
        outDir: 'dist/types',
        insertTypesEntry: true,
        copyDtsFiles: true
      })
    ],
    css: {
      // Global SCSS tokens/mixins injected automatically
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "src/design-tokens/scss/tokens" as *;
            @use "src/styles/mixins" as *;
          `
        }
      }
    },
    build: {
      sourcemap: true,
      emptyOutDir: true,
      cssCodeSplit: true,
      target: 'es2022',
      lib: {
        entry,
        name: 'UiLibrary',
        // ESM + optional CJS for legacy internal apps
        formats: ['es', 'cjs'],
        fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs')
      },
      rollupOptions: {
        // Do not bundle peer runtime deps
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'primereact'
        ],
        output: [
          {
            format: 'es',
            preserveModules: false,
            exports: 'named',
            sourcemap: true,
            interop: 'auto'
          },
          {
            format: 'cjs',
            preserveModules: false,
            exports: 'named',
            sourcemap: true,
            interop: 'auto'
          }
        ]
      }
    },
    // Optional: stricter resolve for design system development
    resolve: {
      dedupe: ['react', 'react-dom']
    },
    define: {
      __DEV__: JSON.stringify(!isProd)
    }
  };
});
```

### Rollup options deep reasoning

- `external`: prevents bundling host-provided frameworks.
- `preserveModules: false`:
  - Simpler dist, fewer files.
  - Better for straightforward consumers.
- `preserveModules: true` alternative:
  - Better per-module granularity and potentially better tree-shaking introspection.
  - More complex exports and publish surface.

**Recommendation:** start with `false`, adopt `true` only if measurement shows clear consumer benefits.

### Excluding stories/tests from production output

- Exclude via `vite-plugin-dts` and `tsconfig.build.json`.
- Do not export story/test modules from `src/index.ts`.
- Use package `files` allowlist to publish only needed artifacts.

---

## 4) Tooling Deep Dive with Full Configs

### 4.1 TypeScript

Why:

- API contracts for component props
- better DX/autocomplete for consumers
- safer refactors for enterprise lifespan

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src", ".storybook", "vite.config.ts", "vitest.config.ts"],
  "exclude": ["dist", "node_modules"]
}
```

### 4.2 ESLint (Flat Config, 2026 standard)

Why:

- Prevents bug classes and anti-patterns.
- Enforces consistency across large teams.

Why not only TypeScript compiler:

- TS catches types, ESLint catches logic/style/safety patterns.

`eslint.config.js`:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'storybook-static/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      import: importPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type'
          ],
          'newlines-between': 'always'
        }
      ]
    }
  },
  {
    files: ['**/*.stories.{ts,tsx}'],
    rules: {
      // Stories are docs/examples, relax strictness as needed
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  eslintConfigPrettier
];
```

### 4.3 Prettier

Why:

- Reduces style debates and PR noise.

`.prettierrc`:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### 4.4 Husky + lint-staged + commitlint

Why:

- Enforce quality before commit and before merge.

`package.json` snippets:

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint .",
    "lint:styles": "stylelint \"src/**/*.{scss,css}\"",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "build": "vite build"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,md,yml,yaml}": ["prettier --write"],
    "*.{ts,tsx,js,jsx}": ["eslint --fix"],
    "*.{scss,css}": ["stylelint --fix"]
  }
}
```

`.husky/pre-commit`:

```sh
npx lint-staged
```

`.husky/commit-msg`:

```sh
npx --no -- commitlint --edit "$1"
```

`commitlint.config.cjs`:

```js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

### 4.5 Stylelint

Why:

- Catches invalid CSS/SCSS patterns, keeps token usage disciplined.

`.stylelintrc.cjs`:

```js
module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],
  ignoreFiles: ['dist/**', 'node_modules/**'],
  rules: {
    'selector-class-pattern': '^[a-z][a-z0-9\\-]+$',
    'declaration-no-important': true,
    // Example: force CSS variable usage where practical
    'scale-unlimited/declaration-strict-value': [
      ['/color/', 'z-index', 'font-size'],
      {
        ignoreValues: ['inherit', 'transparent', 'currentColor', '0'],
        ignoreFunctions: ['var', 'rgba', 'hsl', 'hsla', 'calc'],
        disableFix: true
      }
    ]
  },
  plugins: ['stylelint-scale-unlimited/declaration-strict-value']
};
```

### 4.6 PostCSS

Why:

- Autoprefixing by Browserslist target.
- Optional modern CSS transforms/nesting.

`postcss.config.cjs`:

```js
module.exports = {
  plugins: {
    'postcss-nesting': {},
    autoprefixer: {}
  }
};
```

### 4.7 Browserslist

Why:

- Single source of truth for supported browsers (autoprefixer/transforms).

`.browserslistrc`:

```text
# Enterprise support baseline
>0.5%
last 2 versions
not dead
not op_mini all
not IE 11
```

---

## 5) Storybook 10+ Architecture

### Why Storybook 10+

- Living documentation for components.
- Visual/manual QA plus interaction tests.
- Token/theming validation in isolated environment.

### `storybook` vs `vitest` for testing

**Storybook tests**

- Great for interaction scenarios tied to docs/examples.
- Strong for UI behavior demonstrations and visual alignment.

**Vitest standalone**

- Faster pure unit/logic tests.
- Better low-level test ergonomics and coverage for utilities/hooks.

**Recommendation**

- Use both:
  - Vitest for unit + hook + render contracts.
  - Storybook tests for user-facing interaction stories and docs confidence.

### `.storybook/main.ts`

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-themes'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript'
  }
};

export default config;
```

### `.storybook/preview.ts`

```ts
import type { Preview } from '@storybook/react';
import React from 'react';

import '../src/styles/global.scss';

const withTheme = (Story: React.ComponentType, context: any) => {
  const theme = context.globals.theme || 'light';

  return (
    <div data-theme={theme}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      name: 'Theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' }
        ]
      }
    }
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    a11y: {
      test: 'todo'
    }
  }
};

export default preview;
```

---

## 6) Testing Architecture

### Test pyramid for UI library

- Unit tests: utility functions/constants
- Component behavior tests: props/state/events
- Interaction tests: Storybook stories
- Visual regression (optional): Storybook snapshots or Chromatic-like workflow
- E2E consumer app smoke tests (Playwright)

### Vitest config

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/*.stories.ts', '**/*.stories.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.types.ts',
        'src/index.ts'
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

### Playwright role

- Use for one or two consumer-app smoke journeys:
  - install package
  - render key components
  - theme toggle
  - form interactions

This validates real integration, not just isolated component rendering.

---

## 7) SCSS Architecture and Theming

### Token layers

- **Primitive tokens:** raw values (colors, spacing, typography scales)
- **Semantic tokens:** intent-based (`--color-bg-surface`, `--color-text-primary`)
- **Component tokens:** component-specific overrides (`--button-bg-primary`)

### Recommended structure

```text
src/design-tokens/
  ├─ css/
  │   ├─ primitives.css
  │   ├─ semantic.css
  │   └─ themes/
  │      ├─ light.css
  │      └─ dark.css
  └─ scss/
      ├─ _tokens.scss
      └─ _maps.scss
```

### Token example

`src/design-tokens/css/primitives.css`

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --radius-sm: 6px;
  --font-size-md: 0.875rem;
  --color-blue-600: #2563eb;
  --color-gray-100: #f3f4f6;
  --color-gray-900: #111827;
}
```

`src/design-tokens/css/semantic.css`

```css
:root {
  --color-bg-surface: var(--color-gray-100);
  --color-text-primary: var(--color-gray-900);
  --button-bg-primary: var(--color-blue-600);
}
```

`src/design-tokens/css/themes/dark.css`

```css
[data-theme='dark'] {
  --color-bg-surface: #0b1020;
  --color-text-primary: #f9fafb;
  --button-bg-primary: #3b82f6;
}
```

### CSS Modules vs global SCSS

- Use global token files and reset/utilities globally.
- Use component-scoped SCSS (`button.scss`) with BEM-like class naming.
- Use CSS Modules selectively for highly collision-prone contexts.

### Utility classes

- Keep utility layer intentionally small (layout spacing helpers only).
- Prefer component API props over large utility framework inside DS package.

### PrimeReact wrapper strategy

When wrapping PrimeReact, do not leak PrimeReact API:

`src/components/Button/Button.tsx`

```tsx
import { Button as PrimeButton } from 'primereact/button';
import clsx from 'clsx';

import './button.scss';
import type { ButtonProps } from './button.types';

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  ...rest
}: ButtonProps) {
  return (
    <PrimeButton
      {...rest}
      disabled={disabled}
      className={clsx('ui-button', `ui-button--${variant}`, `ui-button--${size}`)}
      label={typeof children === 'string' ? children : undefined}
    >
      {typeof children === 'string' ? null : children}
    </PrimeButton>
  );
}
```

This keeps your design system as the stable API boundary.

---

## 8) Package.json Best Practices (with explanation)

### Full example

```json
{
  "name": "@company/ui-library",
  "version": "0.1.0",
  "private": false,
  "description": "Enterprise React design system",
  "license": "UNLICENSED",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./style.css": "./dist/style.css",
    "./button": {
      "types": "./dist/types/components/Button/index.d.ts",
      "import": "./dist/components/Button/index.js",
      "require": "./dist/components/Button/index.cjs"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "sideEffects": [
    "**/*.css",
    "**/*.scss"
  ],
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "primereact": "^11.0.0"
  },
  "publishConfig": {
    "access": "restricted",
    "registry": "https://npm.pkg.github.com"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "lint:styles": "stylelint \"src/**/*.{scss,css}\"",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "changeset publish",
    "prepare": "husky"
  },
  "devDependencies": {
    "@changesets/cli": "^2.29.0",
    "@storybook/addon-a11y": "^10.0.0",
    "@storybook/addon-essentials": "^10.0.0",
    "@storybook/addon-interactions": "^10.0.0",
    "@storybook/addon-themes": "^10.0.0",
    "@storybook/react-vite": "^10.0.0",
    "@types/node": "^24.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^10.0.0",
    "eslint-plugin-import": "^2.0.0",
    "eslint-plugin-react": "^7.0.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^16.0.0",
    "postcss": "^8.0.0",
    "postcss-nesting": "^13.0.0",
    "prettier": "^3.0.0",
    "storybook": "^10.0.0",
    "stylelint": "^16.0.0",
    "stylelint-config-recess-order": "^7.0.0",
    "stylelint-config-standard-scss": "^15.0.0",
    "stylelint-scale-unlimited": "^1.0.0",
    "typescript": "^5.9.0",
    "typescript-eslint": "^8.0.0",
    "vite": "^7.0.0",
    "vite-plugin-dts": "^4.0.0",
    "vitest": "^3.0.0"
  }
}
```

### Field-by-field rationale

- `exports`: controls public API surface, safer than implicit file access.
- `types`: direct TS declaration entry.
- `sideEffects`: preserve style imports from accidental tree-shaking removal.
- `files`: publish allowlist for security/size control.
- `publishConfig`: registry and access defaults, avoids accidental public publish.
- `engines`: standardize Node/npm in enterprise CI.

---

## 9) Private Hosting Strategy Comparison (GitHub vs Azure)

## Comparison Table

| Option | Security & Access Control | Cost | CI/CD Integration | Developer Experience | Best Fit |
|---|---|---|---|---|---|
| GitHub Packages (npm registry) | GitHub org/team permissions, PAT/GITHUB_TOKEN | Included in GitHub plans/storage quotas | Excellent with GitHub Actions | Great for GitHub-centric teams | GitHub-first org |
| GitHub Releases tarball | Repo access controls only, less package-native | Low | Easy but manual semantics | Weak npm-native experience | Rare fallback |
| git+ssh dependency | Repo access via SSH keys | Low | Minimal pipeline complexity | Poor lockfile/versioning consistency | Temporary internal prototyping |
| Azure Artifacts npm feed | Fine-grained Azure DevOps feed permissions | Paid via Azure DevOps usage model | Excellent in Azure Pipelines | Strong for Azure-managed enterprises | Azure-first org |
| Azure + GitHub hybrid | Split control plane, flexible | Potentially higher operational overhead | High (but more wiring) | Good if governance split is needed | Mixed enterprise ecosystems |

### Recommendation by enterprise profile

- **GitHub-centric engineering organization:** GitHub Packages + Actions.
- **Azure-governed enterprise platform:** Azure Artifacts + Azure Pipelines.
- **Hybrid governance:** source in GitHub, publish to Azure Artifacts via federated pipeline.

### `.npmrc` examples

#### GitHub Packages (local developer)

```ini
@company:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
always-auth=true
```

#### Azure Artifacts (local developer)

```ini
@company:registry=https://pkgs.dev.azure.com/<org>/<project>/_packaging/<feed>/npm/registry/
always-auth=true
```

Then authenticate via Azure tooling/token:

```bash
npx vsts-npm-auth -config .npmrc
```

### `publishConfig` examples

GitHub:

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```

Azure:

```json
{
  "publishConfig": {
    "registry": "https://pkgs.dev.azure.com/<org>/<project>/_packaging/<feed>/npm/registry/"
  }
}
```

---

## 10) CI/CD Implementation

### A) GitHub Actions publishing with Changesets

`.github/workflows/release.yml`

```yaml
name: Release UI Library

on:
  push:
    branches: [main]

permissions:
  contents: write
  packages: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: 'https://npm.pkg.github.com'
          scope: '@company'
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Validate
        run: |
          npm run lint
          npm run lint:styles
          npm run typecheck
          npm run test
          npm run build
          npm run build-storybook

      - name: Create release PR / publish
        uses: changesets/action@v1
        with:
          version: npm run version-packages
          publish: npm run release
          title: 'chore(release): version packages'
          commit: 'chore(release): version packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### B) Azure Pipeline publishing to Azure Artifacts

`azure-pipelines.yml`

```yaml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: ubuntu-latest

steps:
  - checkout: self
    fetchDepth: 0

  - task: NodeTool@0
    inputs:
      versionSpec: '22.x'
    displayName: 'Use Node.js 22'

  - task: npmAuthenticate@0
    inputs:
      workingFile: .npmrc
    displayName: 'Authenticate to npm feeds'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: |
      npm run lint
      npm run lint:styles
      npm run typecheck
      npm run test
      npm run build
      npm run build-storybook
    displayName: 'Validate package'

  - script: |
      npm run version-packages
      npm publish
    displayName: 'Publish to Azure Artifacts'
```

### C) Azure + GitHub hybrid

Flow:

1. PR and source control in GitHub.
2. GitHub Actions validates.
3. Release event triggers Azure Pipeline (or vice versa).
4. Azure publishes to Artifacts feed.
5. Internal apps consume from Azure feed.

This is common when platform security is centralized in Azure but development is GitHub-native.

---

## 11) Consumer App Installation Guide

### GitHub Packages

In consumer app `.npmrc`:

```ini
@company:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
always-auth=true
```

Install:

```bash
npm install @company/ui-library
```

### Azure Artifacts

In consumer app `.npmrc`:

```ini
@company:registry=https://pkgs.dev.azure.com/<org>/<project>/_packaging/<feed>/npm/registry/
always-auth=true
```

Install:

```bash
npm install @company/ui-library
```

---

## 12) Storybook vs Vitest vs Playwright (Decision Matrix)

| Capability | Vitest | Storybook Tests | Playwright |
|---|---|---|---|
| Unit logic speed | Excellent | Weak | Poor |
| Component behavior in isolation | Excellent | Good | Medium |
| Docs-integrated interactions | Limited | Excellent | Medium |
| Real browser integration | Medium (jsdom by default) | Medium | Excellent |
| Consumer app confidence | Low | Medium | Excellent |

Recommended combined strategy:

- Vitest for fast PR gates.
- Storybook interaction tests for component usage docs and UX sanity.
- Playwright smoke for integration confidence in at least one consuming app.

---

## 13) Tradeoffs and Enterprise Scalability Analysis

### Major decisions with self-critique

1. **ESM-first packaging**
   - Gain: modern, shakeable, lean.
   - Lose: legacy tooling friction.
   - Risk mitigation: provide CJS fallback until all internal apps modernize.

2. **External CSS**
   - Gain: cacheability and explicit control.
   - Lose: one extra import requirement.
   - Risk mitigation: document mandatory style import and validate in smoke tests.

3. **Single package starting point**
   - Gain: speed to first release.
   - Lose: eventual scaling limits for tokens/icons/runtime split.
   - Risk mitigation: define monorepo migration criteria up front.

4. **PrimeReact wrapping**
   - Gain: fast component delivery.
   - Lose: dependency coupling and potential style collisions.
   - Risk mitigation: strict adapter layer and no PrimeReact props leakage.

5. **GitHub vs Azure package hosting**
   - Gain (GitHub): simpler if code lives there.
   - Gain (Azure): stronger integration for Azure-governed enterprises.
   - Lose: hybrid model adds operational complexity.
   - Risk mitigation: choose one as source of truth registry per environment.

### Scaling limitations to monitor

- Component build times as count grows
- Storybook build duration
- Token drift between code and design artifacts
- API surface creep (too many unstable exports)
- Visual regression debt without automated screenshot baseline

---

## 14) Step-by-Step Implementation Roadmap

### Phase 0 - Bootstrap

1. Initialize package with Vite + React + TS.
2. Add SCSS, PostCSS, Stylelint, ESLint flat config, Prettier.
3. Add Storybook 10 with Vite builder.

### Phase 1 - Foundation

1. Build token architecture (primitive -> semantic -> theme).
2. Define component template (files and naming from required structure).
3. Set linting, typecheck, tests, story coverage thresholds.

### Phase 2 - Build and package hardening

1. Finalize `vite.config.ts` for library mode + externals + declarations.
2. Validate publish artifact with `npm pack`.
3. Lock `exports` map and avoid deep import leaks.

### Phase 3 - CI/CD and release governance

1. Add PR checks (lint/style/type/test/build/storybook build).
2. Add Changesets workflow for SemVer and changelog.
3. Add publish workflow to selected private registry.

### Phase 4 - Consumer rollout

1. Integrate in one pilot internal app.
2. Track bundle impact and runtime compatibility.
3. Add rollback SOP and release communication template.

### Phase 5 - Scale up

1. Add visual regression automation.
2. Add accessibility test budget per component.
3. Consider monorepo split for tokens/icons/core if growth demands.

---

## 15) Additional Enterprise Recommendations

1. **Design governance**
   - Keep Figma token source synchronized with code tokens through an automated token pipeline (or periodic sync job).

2. **API stability policy**
   - Enforce deprecation windows (for example: 2 minor versions before removal).

3. **Telemetry and adoption**
   - Track component usage in internal apps to identify dead/critical components.

4. **Security posture**
   - Enable dependency scanning + lockfile policy + signed commits/tags where possible.

5. **Documentation quality gates**
   - Block release if Storybook docs for changed components are missing.

---

## 16) Quick Start Commands (Template)

```bash
npm create vite@latest ui-library -- --template react-ts
cd ui-library
npm install

# Storybook 10+
npx storybook@latest init --builder vite

# Linting/format/style/testing ecosystem
npm i -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import eslint-config-prettier prettier
npm i -D stylelint stylelint-config-standard-scss stylelint-config-recess-order stylelint-scale-unlimited
npm i -D postcss postcss-nesting autoprefixer
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm i -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npm i -D vite-plugin-dts @changesets/cli
```

---

## Final Recommendation

For your stated requirements, the most practical enterprise baseline is:

- Vite library mode
- Storybook 10 with Vite builder
- ESM-first package (+ optional CJS bridge)
- External CSS file + token-driven theming
- Strict typed public API and controlled exports
- Changesets-based version governance
- Private registry via either GitHub Packages or Azure Artifacts (choose one primary registry)
- CI release automation with PR quality gates

This gives you a scalable foundation that can evolve from a single package into a platform-level design system without costly re-architecture.
