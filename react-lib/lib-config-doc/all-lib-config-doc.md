# UI Component Library — Final Configuration Reference

> Every config file, final decided code, with explanations.
> Copy-paste ready. No diffs, no "what to change" — just the configs.

---

## Table of Contents

| # | File | Section |
|---|------|---------|
| 1 | `package.json` | [Section 1](#1-packagejson) |
| 2 | `tsconfig.json` | [Section 2](#2-tsconfigjson-root) |
| 3 | `tsconfig.app.json` | [Section 3](#3-tsconfigappjson) |
| 4 | `tsconfig.node.json` | [Section 4](#4-tsconfignodejson) |
| 5 | `vite.config.ts` | [Section 5](#5-viteconfigts) |
| 6 | `eslint.config.js` | [Section 6](#6-eslintconfigjs) |
| 7 | `stylelint.config.mjs` | [Section 7](#7-stylelintconfigmjs) |
| 8 | `.prettierrc` | [Section 8](#8-prettierrc) |
| 9 | `.prettierignore` | [Section 9](#9-prettierignore) |
| 10 | `postcss.config.mjs` | [Section 10](#10-postcssconfigmjs) |
| 11 | `.editorconfig` | [Section 11](#11-editorconfig) |
| 12 | `.vscode/settings.json` | [Section 12](#12-vscodesettingsjson) |
| 13 | `.vscode/extensions.json` | [Section 13](#13-vscodeextensionsjson) |
| 14 | `.gitignore` | [Section 14](#14-gitignore) |
| 15 | `.husky/pre-commit` | [Section 15](#15-huskypre-commit) |
| 16 | `.changeset/config.json` | [Section 16](#16-changesetconfigjson) |
| 17 | Install Command | [Section 17](#17-install-command) |
| 18 | Component Directory Convention | [Section 18](#18-component-directory-convention) |
| 19 | Build Output | [Section 19](#19-build-output) |

---

## 1. `package.json`

```json
{
  "name": "app-react-ui-lib",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "license": "UNLICENSED",

  "files": ["dist"],
  "main": "./dist/main.js",
  "types": "./dist/main.d.ts",

  "exports": {
    ".": {
      "types": "./dist/main.d.ts",
      "import": "./dist/main.js"
    }
  },

  "sideEffects": ["*.css", "*.scss"],

  "engines": {
    "node": ">=20"
  },

  "browserslist": [
    "last 2 Chrome versions",
    "last 2 Firefox versions",
    "last 2 Safari versions",
    "last 2 Edge versions"
  ],

  "scripts": {
    "build": "tsc -b && vite build",
    "prepublishOnly": "npm run build",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "lint:styles": "stylelint \"src/**/*.{css,scss}\"",
    "lint:styles:fix": "stylelint \"src/**/*.{css,scss}\" --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "storybook": "storybook dev -p 6006 --no-open",
    "build-storybook": "storybook build",
    "validate": "npm run typecheck && npm run lint && npm run lint:styles && npm run format:check && npm run test",
    "prepare": "husky",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "npm run build && changeset publish"
  },

  "peerDependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },

  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --no-warn-ignored",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md,mdx,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

### Explanation

| Field | Why |
|-------|-----|
| `"type": "module"` | All `.js` files are ESM. Required for Vite, ESLint flat config, and modern tooling. |
| `"main"` | Fallback entry for older bundlers that don't read `"exports"`. |
| `"types"` | TypeScript entry point for consumers. Points to generated `.d.ts`. |
| `"exports"` | Modern entry map. `"types"` listed before `"import"` because TypeScript resolves top-to-bottom. No `"./*"` wildcard — prevents consumers importing internal files. |
| `"sideEffects"` | Tells bundlers CSS/SCSS imports are side effects. Without this, tree-shaking removes your styles. |
| `"engines"` | Enforces Node 20+ for CI and contributors. |
| `"browserslist"` | Narrows autoprefixer output. Prevents generating prefixes for dead browsers (IE11). |
| `"prepare": "husky"` | Auto-installs git hooks on `npm install`. |
| `"validate"` | Single command to run the entire quality pipeline. Use in CI. |
| `"lint": "eslint ."` | No `--ext` flag — ESLint 9 flat config ignores it. File filtering is handled by `files` globs in the config. |
| `lint-staged` | Runs linters only on staged files during `git commit`. `--no-warn-ignored` suppresses ESLint 9 warnings for files matching `globalIgnores`. |
| No `"module"` field | Legacy webpack 2 convention. Redundant with `"exports"` + `"type": "module"`. |

---

## 2. `tsconfig.json` (root)

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### Explanation

| Field | Why |
|-------|-----|
| `"files": []` | Root config compiles nothing itself. It only orchestrates project references. |
| `"references"` | `tsconfig.app.json` covers `src/` (library code). `tsconfig.node.json` covers `vite.config.ts` (build tooling). Separate configs prevent Node types leaking into browser code. |

---

## 3. `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "declaration": true,
    "declarationMap": true,

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

### Explanation

| Field | Why |
|-------|-----|
| `"target": "ES2022"` | Modern output. Consumers' bundlers handle further downleveling. |
| `"lib": ["ES2022", "DOM", "DOM.Iterable"]` | Browser globals + modern JS APIs. No `DOM.AsyncIterable` — keep it minimal. |
| `"types": ["vite/client"]` | Provides types for `import.meta.env`, CSS module imports, asset imports. |
| `"moduleResolution": "bundler"` | Matches Vite's resolution behavior. Understands `"exports"` maps, `.tsx` extensions. |
| `"verbatimModuleSyntax": true` | Forces explicit `import type` syntax. Works with ESLint's `consistent-type-imports` rule. |
| `"noEmit": true` | `tsc` only type-checks. `vite-plugin-dts` handles `.d.ts` generation. |
| `"jsx": "react-jsx"` | React 17+ JSX transform. No need to import React in every file. |
| `"declaration": true` | Tells `vite-plugin-dts` to generate `.d.ts` files. |
| `"declarationMap": true` | Generates `.d.ts.map`. Lets consumers "Go to Definition" into your `.tsx` source instead of landing on `.d.ts`. |
| `"strict": true` | Non-negotiable for a library. Catches type errors before consumers do. |
| `"erasableSyntaxOnly": true` | Prepares for `--isolatedDeclarations`. Only allows syntax that can be erased without type information. |
| `"noUncheckedSideEffectImports": true` | Catches `import './styles.css'` pointing to non-existent files. |
| `"include": ["src"]` | Only library source. Config files, storybook files covered by other tsconfigs. |

---

## 4. `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

### Explanation

| Field | Why |
|-------|-----|
| `"target": "ES2023"` | Vite config runs in Node, not the browser. Node 20+ supports ES2023. |
| `"types": ["node"]` | Provides `path`, `url`, `fs`, `__dirname` types. No DOM types here. |
| `"include": ["vite.config.ts"]` | Only covers build tooling. Keeps Node types out of library source. |

---

## 5. `vite.config.ts`

```js
/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { globSync } from 'glob';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

// CMD: ESM has no __dirname — derive it from import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    // CMD: React JSX transform + fast refresh for Storybook dev
    react(),
    // CMD: Inject CSS imports into JS chunks so consumers get styles automatically
    libInjectCss(),
    // CMD: Generate .d.ts and .d.ts.map from tsconfig.app.json settings
    dts({
      tsconfigPath: 'tsconfig.app.json',
      // CMD: Skip type-checking here — tsc handles that via the validate script
      skipDiagnostics: true,
      // CMD: Keep test/story/vite types out of the published dist
      exclude: ['**/*.stories.tsx', '**/*.test.tsx', 'src/vite-env.d.ts'],
    }),
  ],

  build: {
    // CMD: Consumers need source maps to debug your library
    sourcemap: true,
    // CMD: Clean dist/ before every build
    emptyOutDir: true,
    // CMD: Libraries don't serve a public/ directory
    copyPublicDir: false,

    lib: {
      // CMD: Primary entry — required to activate Vite library mode
      // CMD: Overridden by rollupOptions.input for actual multi-entry resolution
      entry: path.resolve(__dirname, 'src/main.ts'),
      // CMD: ES modules only — no UMD/CJS needed for a modern React library
      formats: ['es'],
    },

    rollupOptions: {
      // CMD: Peer deps — never bundle React into the library
      external: ['react', 'react-dom', 'react/jsx-runtime'],

      // CMD: Multi-entry — only barrel files (index.ts) and the root barrel (main.ts)
      // CMD: Internal files (Button.tsx, utils.ts) stay private
      input: Object.fromEntries(
        globSync(['src/**/index.{ts,tsx}', 'src/main.ts']).map((file) => {
          // CMD: Strip src/ prefix and file extension to create clean entry names
          const relativePath = path.relative('src', file);
          const extLength = path.extname(file).length;
          // CMD: .slice(0, -extLength) removes extension from the end — no string searching
          // CMD: .split(path.sep).join('/') normalizes backslashes on Windows
          const entryName = relativePath
            .slice(0, -extLength)
            .split(path.sep)
            .join('/');

          return [entryName, fileURLToPath(new URL(file, import.meta.url))];
        }),
      ),

      output: {
        // CMD: Preserve directory structure in dist/ — maps to package.json exports
        entryFileNames: '[name].js',
        // CMD: Shared code between entries goes to chunks/ with stable hashed names
        chunkFileNames: 'chunks/[name]-[hash].js',
        // CMD: Deterministic CSS names — no content hashes, stable for libInjectCss
        assetFileNames: 'assets/[name][extname]',
        // CMD: No globals — only needed for UMD/IIFE, not ES modules
      },
    },
  },

  test: {
    projects: [
      {
        // CMD: Inherit root Vite config (resolve, plugins, etc.)
        extends: true,
        test: {
          name: 'unit',
          // CMD: Lightweight DOM simulation for standard unit tests
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          // CMD: Storybook addon-vitest generates .stories.test.tsx — those need a real browser
          exclude: ['src/**/*.stories.test.tsx'],
        },
      },
      {
        extends: true,
        plugins: [
          // CMD: Runs interaction tests defined in .stories.tsx files
          storybookTest({ configDir: path.join(__dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            // CMD: Real browser testing via Playwright — not jsdom
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
```

---

## 6. `eslint.config.js`

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

  // ── 1. GLOBAL IGNORES ──
  // CMD: Directories that should never be linted
  globalIgnores([
    'dist',
    'build',
    'coverage',
    'storybook-static',
    'node_modules',
    '**/*.d.ts',
  ]),

  // ── 2. BASE JAVASCRIPT RULES ──
  // CMD: ESLint's built-in recommended rules (no-unused-vars, no-undef, etc.)
  js.configs.recommended,

  // ── 3. TYPESCRIPT — STRICT TYPE-AWARE LINTING ──
  // CMD: Strictest preset — includes recommended + strict + type-checked rules
  ...tseslint.configs.strictTypeChecked,

  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      parserOptions: {
        // CMD: Uses tsconfig project references for type-aware linting
        projectService: true,
        // CMD: Resolves tsconfig relative to this config file's directory
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        // CMD: Browser globals (window, document, fetch, etc.)
        ...globals.browser,
        // CMD: ES2024 globals (structuredClone, etc.)
        ...globals.es2024,
      },
    },

    rules: {
      // CMD: Ban `any` — forces proper typing in a library
      '@typescript-eslint/no-explicit-any': 'error',

      // CMD: Enforce `import type { Foo }` syntax — pairs with verbatimModuleSyntax
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      // CMD: Allow unused vars prefixed with _ (common for destructuring)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // CMD: Catch forgotten awaits on promises
      '@typescript-eslint/no-floating-promises': 'error',

      // CMD: Prevent passing async functions where void callbacks are expected
      // CMD: attributes: false avoids false positives on React event handlers (onClick, etc.)
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],

      // CMD: Suggest cleaner syntax — foo?.bar instead of foo && foo.bar
      '@typescript-eslint/prefer-optional-chain': 'warn',
      // CMD: Suggest foo ?? 'default' instead of foo || 'default'
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    },
  },

  // ── 4. REACT + JSX ACCESSIBILITY ──
  {
    files: ['**/*.{jsx,tsx}'],

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },

    settings: {
      // CMD: Auto-detect React version from package.json
      react: { version: 'detect' },
    },

    rules: {
      // CMD: Spread recommended rules from each plugin
      ...reactPlugin.configs.recommended.rules,
      // CMD: jsx-runtime rules — disables "React must be in scope" for React 17+ transform
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // CMD: TypeScript handles prop validation — prop-types not needed
      'react/prop-types': 'off',
      'react/require-default-props': 'off',

      // CMD: Require displayName on components — helps React DevTools debugging
      'react/display-name': 'error',
      // CMD: Prevent defining components inside render — causes remounts
      'react/no-unstable-nested-components': 'error',
      // CMD: target="_blank" must have rel="noreferrer" for security
      'react/jsx-no-target-blank': 'error',
      // CMD: Prevent {count && <Comp />} rendering "0" — use {count > 0 && <Comp />}
      'react/jsx-no-leaked-render': 'error',
      // CMD: Array index as key causes bugs with reordering — warn, not error (sometimes acceptable)
      'react/no-array-index-key': 'warn',
      // CMD: <div></div> → <div /> when no children
      'react/self-closing-comp': 'error',

      // CMD: Forces prop="value" instead of prop={"value"}
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      // CMD: Enforces [foo, setFoo] naming convention for useState
      'react/hook-use-state': 'warn',

      // CMD: Anchor tags must have valid href or use button instead
      'jsx-a11y/anchor-is-valid': 'warn',
    },
  },

  // ── 5. VITE FAST REFRESH (SRC ONLY) ──
  // CMD: Warns when a file exports non-components alongside components
  // CMD: Kept as warn — produces false positives on barrel files in a library
  {
    files: ['src/**/*.{jsx,tsx}'],

    plugins: {
      'react-refresh': reactRefresh,
    },

    rules: {
      'react-refresh/only-export-components': [
        'warn',
        // CMD: Allow `export const meta = {...}` alongside component exports
        { allowConstantExport: true },
      ],
    },
  },

  // ── 6. IMPORT SORTING & CODE ORGANIZATION ──
  // CMD: Deterministic import/export ordering across the team
  {
    plugins: { perfectionist },

    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          groups: [
            'type',         // CMD: import type { Foo } from ...
            'builtin',      // CMD: import path from 'node:path'
            'external',     // CMD: import React from 'react'
            'internal',     // CMD: import { Button } from '@/components'
            ['parent', 'sibling', 'index'], // CMD: relative imports
            'side-effect',  // CMD: import './styles.css'
            'style',        // CMD: import styles from './foo.module.css'
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

  // ── 7. IMPORT SAFETY — CIRCULAR DEPENDENCY DETECTION ──
  // CMD: Catches circular imports up to 4 levels deep — critical for a library
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

  // ── 8. LIBRARY SAFETY RULES ──
  // CMD: General code quality rules applied to all files
  {
    rules: {
      // CMD: No console.log in library code — allow warn/error for legitimate warnings
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // CMD: const over let when variable is never reassigned
      'prefer-const': 'error',
      // CMD: Ban var — use let/const
      'no-var': 'error',
      // CMD: Always use braces: if (x) { return; } not if (x) return;
      curly: ['error', 'all'],
      // CMD: Always use === instead of ==
      eqeqeq: ['error', 'always'],
    },
  },

  // ── 9. STORYBOOK FILES ──
  // CMD: Relaxed rules for story files — any types and multiple exports are fine
  {
    files: ['**/*.stories.@(ts|tsx|js|jsx|mjs|cjs|mdx)'],

    extends: [storybook.configs['flat/recommended']],

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },

  // ── 10. TEST FILES + VITEST RULES ──
  // CMD: Relaxed rules for tests — any/non-null-assertion are acceptable in tests
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

  // ── 11. CONFIG FILE OVERRIDE ──
  // CMD: Config files (.js, .mjs, .cjs) aren't in any tsconfig project
  // CMD: Disable type-checked rules that would error on them
  {
    files: ['*.config.{js,ts,mjs,cjs}', '.storybook/**/*.{ts,js}'],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // ── 12. PRETTIER — MUST BE LAST ──
  // CMD: Disables all ESLint formatting rules that conflict with Prettier
  // CMD: Prettier owns formatting, ESLint owns code quality
  eslintConfigPrettier,
]);
```

---

## 7. `stylelint.config.mjs`

```js
/** @type {import('stylelint').Config} */
export default {
  // CMD: SCSS-aware standard rules + Recess-based property ordering
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],

  // CMD: Parse SCSS syntax (nesting, variables, etc.)
  customSyntax: 'postcss-scss',

  // CMD: Never lint generated/dependency directories
  ignoreFiles: ['dist/**', 'node_modules/**', 'storybook-static/**', 'coverage/**', 'build/**'],

  // CMD: Strict disable-comment hygiene — catch stale/invalid stylelint-disable comments
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,

  rules: {
    // CMD: BEM-like pattern: block-name__element--modifier
    'selector-class-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9-]+)?(--[a-z0-9-]+)?$',
    // CMD: No ID selectors — too specific for component library CSS
    'selector-max-id': 0,

    // CMD: --ds-* for design tokens, --_* for component-internal properties
    'custom-property-pattern': '^(ds-|_)[a-z0-9-]+$',

    // CMD: Force design tokens — no raw hex colors in component styles
    'color-no-hex': true,
    // CMD: No named colors (red, blue) — use tokens
    'color-named': 'never',

    // CMD: THE CORE RULE — forces design token usage for all visual properties
    // CMD: Only var(--ds-*) tokens, transparent, currentColor, inherit allowed
    'declaration-property-value-allowed-list': {
      '/color/': ['/^var\\(--ds-/', 'transparent', 'currentColor', 'inherit'],
      background: ['/^var\\(--ds-/', 'none', 'transparent', 'inherit'],
      '/padding|margin|gap/': ['/^var\\(--ds-spacing-/', '0', 'auto', 'inherit'],
      'z-index': ['/^var\\(--ds-z-/', 'auto', '0', '-1'],
      'border-radius': ['/^var\\(--ds-radius-/', '0', '50%', 'inherit'],
      'font-size': ['/^var\\(--ds-font-size-/', 'inherit'],
      'font-weight': ['/^var\\(--ds-font-weight-/', 'inherit'],
      'box-shadow': ['/^var\\(--ds-shadow-/', 'none', 'inherit'],
    },

    // CMD: !important is banned — specificity should be managed via structure
    'declaration-no-important': true,
    // CMD: autoprefixer handles prefixes — don't write them manually
    'property-no-vendor-prefix': true,
    'value-no-vendor-prefix': true,

    // CMD: 3 levels max — deeper nesting means the component is too complex
    'max-nesting-depth': 3,
    // CMD: Disable — too many false positives with nested selectors
    'no-descending-specificity': null,

    // CMD: Pattern that matches nothing — effectively bans all SCSS $variables
    'scss/dollar-variable-pattern': '^__forbidden__$',

    // CMD: Ban all SCSS logic features — use plain CSS with nesting
    // CMD: Mixins, functions, loops, conditionals — all banned
    'at-rule-disallowed-list': [
      ['extend', 'mixin', 'include', 'function', 'if', 'else', 'for', 'each', 'while', 'return'],
      { message: 'SCSS features like mixins and logic are banned. Use plain CSS with nesting.' },
    ],
  },

  overrides: [
    {
      // CMD: Token and theme files ARE allowed to use hex colors and raw values
      // CMD: This is where design tokens are defined
      files: ['**/tokens/**/*.{css,scss}', '**/themes/**/*.{css,scss}'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'declaration-property-value-allowed-list': null,
      },
    },
  ],
};

// CMD: Property ordering inherited from stylelint-config-recess-order:
// 1. position / inset / z-index / float
// 2. display / visibility
// 3. flex / grid / alignment / order
// 4. width / height / sizing
// 5. padding / margin
// 6. overflow / containment / scrolling
// 7. font / line-height / text / color
// 8. interaction / cursor / outline
// 9. background / border / border-radius / box-shadow
// 10. filter / mask / transform / transition / animation
```

---

## 8. `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "bracketSameLine": false
}
```

| Option | Why |
|--------|-----|
| `"singleQuote": true` | Industry standard for JS/TS. Matches ESLint ecosystem defaults. |
| `"printWidth": 100` | Wider than default 80. Reduces artificial line breaks in JSX props. |
| `"trailingComma": "all"` | Cleaner git diffs — adding an item doesn't modify the previous line. |
| `"endOfLine": "lf"` | Prevents CRLF/LF conflicts across Windows/Mac/Linux. |
| `"bracketSameLine": false` | JSX closing `>` on its own line — easier to read props. |

---

## 9. `.prettierignore`

```
dist
build
coverage
storybook-static
node_modules
pnpm-lock.yaml
package-lock.json
*.min.js
*.min.css
```

CMD: Without this, Prettier tries to format generated/minified files and lockfiles.

---

## 10. `postcss.config.mjs`

```js
// CMD: ESM format — matches "type": "module" in package.json
// CMD: Object syntax — PostCSS 8+ resolves plugins by name, no require() needed
export default {
  plugins: {
    autoprefixer: {},
  },
};
```

CMD: `autoprefixer` reads `browserslist` from `package.json` to determine which prefixes to generate.

---

## 11. `.editorconfig`

```ini
# CMD: Fallback for editors without Prettier (GitHub web editor, vim, nano)
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

# CMD: Markdown uses trailing whitespace for line breaks
[*.md]
trim_trailing_whitespace = false
```

---

## 12. `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit",
    "source.organizeImports": "never"
  },

  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],

  "stylelint.validate": ["css", "postcss", "scss"],

  "css.validate": false,
  "scss.validate": false
}
```

| Setting | Why |
|---------|-----|
| `"editor.formatOnSave"` | Prettier formats on every save. |
| `"editor.defaultFormatter"` | Prettier handles all file types. |
| `"source.fixAll.eslint": "explicit"` | ESLint auto-fixes on save — import sorting, self-closing components, curly braces, etc. |
| `"source.fixAll.stylelint": "explicit"` | Stylelint auto-fixes on save — property ordering, etc. |
| `"source.organizeImports": "never"` | VS Code's built-in import organizer conflicts with `perfectionist/sort-imports`. Disabled. |
| `"css.validate": false` | VS Code's built-in CSS linter conflicts with Stylelint. Disabled. |
| `"scss.validate": false` | Same — Stylelint is the single source of truth for style linting. |

### Save Pipeline

**`.tsx` file saved:**
1. Prettier formats → 2. ESLint auto-fixes (imports, JSX cleanup)

**`.scss` file saved:**
1. Prettier formats → 2. Stylelint auto-fixes (property ordering)

---

## 13. `.vscode/extensions.json`

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "stylelint.vscode-stylelint"
  ]
}
```

CMD: VS Code prompts teammates to install these when they open the project. Ensures everyone has the same save-on-format behavior.

---

## 14. `.gitignore`

```gitignore
# Dependencies
node_modules

# Build output
dist
dist-ssr
build
storybook-static

# Test output
coverage

# Environment
*.local
.env
.env.*

# IDE — keep shared settings, ignore personal config
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
*storybook.log

# OS
Thumbs.db
```

---

## 15. `.husky/pre-commit`

```sh
npx lint-staged
```

CMD: One line. Husky v9+ needs nothing else — no `#!/usr/bin/env sh`, no sourcing.

### Setup Commands

```bash
# CMD: Install husky and lint-staged
npm install -D husky lint-staged

# CMD: Initialize husky — creates .husky/ directory
npx husky init

# CMD: Replace .husky/pre-commit contents with: npx lint-staged
```

CMD: `"prepare": "husky"` in package.json scripts auto-installs hooks on `npm install` for all contributors.

---

## 16. `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "your-org/app-ux" }],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

| Field | Why |
|-------|-----|
| `"changelog"` | Auto-generates CHANGELOG.md with GitHub PR links. Replace `your-org/app-ux` with your repo. |
| `"access": "restricted"` | Private/org package. Use `"public"` for npm public packages. |
| `"commit": false` | Don't auto-commit version bumps — let CI handle it. |

### Setup Commands

```bash
npm install -D @changesets/cli @changesets/changelog-github
npx changeset init
```

### Workflow

1. `npx changeset` — describe your change (patch/minor/major).
2. Merge to main.
3. `npx changeset version` — bumps version, updates CHANGELOG.md.
4. `npm run release` — builds and publishes.

---

## 17. Install Command

Everything in one command:

```bash
npm install -D eslint-plugin-react eslint-plugin-jsx-a11y eslint-plugin-perfectionist eslint-plugin-import-x eslint-import-resolver-typescript eslint-plugin-vitest eslint-config-prettier prettier stylelint stylelint-config-standard-scss stylelint-config-recess-order stylelint-order postcss-scss husky lint-staged jsdom @testing-library/react @testing-library/jest-dom @changesets/cli @changesets/changelog-github
```

---

## 18. Component Directory Convention

```
src/
├── components/
│   ├── button/
│   │   ├── Button.tsx              ← component implementation (internal)
│   │   ├── Button.types.ts         ← types (internal, re-export through index.ts)
│   │   ├── Button.stories.tsx      ← storybook (excluded from build)
│   │   ├── Button.test.tsx         ← unit tests (excluded from build)
│   │   ├── button.scss             ← styles (bundled into index.js by libInjectCss)
│   │   └── index.ts               ← PUBLIC ENTRY: export { Button } from './Button'
│   ├── text-input/
│   │   ├── TextInput.tsx
│   │   ├── TextInput.types.ts
│   │   ├── TextInput.stories.tsx
│   │   ├── TextInput.test.tsx
│   │   ├── text-input.scss
│   │   └── index.ts
│   └── ...
├── styles/
│   ├── tokens/                     ← design tokens (hex allowed by stylelint override)
│   ├── themes/                     ← theme overrides (hex allowed by stylelint override)
│   └── index.scss
└── main.ts                         ← root barrel: export * from './components/button'
```

**Rules:**
- Only `index.ts` files and `main.ts` become build entries.
- Internal files are bundled into the entry but not independently importable.
- Types consumers need are re-exported through `index.ts`.

---

## 19. Build Output

```
dist/
├── main.js
├── main.js.map
├── main.d.ts
├── main.d.ts.map
├── components/
│   ├── button/
│   │   ├── index.js              ← entry (contains CSS import via libInjectCss)
│   │   ├── index.js.map
│   │   ├── index.d.ts
│   │   └── index.d.ts.map       ← Go-to-Definition jumps to Button.tsx source
│   └── text-input/
│       ├── index.js
│       ├── index.js.map
│       ├── index.d.ts
│       └── index.d.ts.map
├── assets/
│   ├── button.css                ← auto-injected by libInjectCss into index.js
│   └── text-input.css
└── chunks/                       ← only if Rollup extracts shared code between entries
    └── shared-abc123.js
```
