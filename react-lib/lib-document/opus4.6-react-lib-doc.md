# Enterprise React Design System UI Library — Architectural Blueprint

> **Audience**: CTOs, Lead Engineers, and developers building their first design system.
> **Stack snapshot (latest stable as of March 2026)**: React 19.2 · Vite 7.2 · Storybook 10.2 · TypeScript 5.9 · Vitest 4.0 · ESLint 9.39 (flat config) · Prettier · Husky 9.1 · Stylelint 16 · PostCSS · SCSS (Dart Sass 1.97) · Rollup (via Vite) · Azure DevOps + GitHub

---

## Table of Contents

1. [Executive Architecture Overview](#1-executive-architecture-overview)
2. [Folder Structure Justification](#2-folder-structure-justification)
3. [Architecture-Level Deep Research](#3-architecture-level-deep-research)
4. [Private Hosting Strategy — Deep Comparison](#4-private-hosting-strategy--deep-comparison)
5. [Vite Build Configuration — Deep Dive](#5-vite-build-configuration--deep-dive)
6. [Tooling Deep Dives with Actual Code](#6-tooling-deep-dives-with-actual-code)
7. [Storybook 10+ Architecture](#7-storybook-10-architecture)
8. [Testing Architecture](#8-testing-architecture)
9. [SCSS Architecture](#9-scss-architecture)
10. [package.json Best Practices](#10-packagejson-best-practices)
11. [CI/CD End-to-End Implementation](#11-cicd-end-to-end-implementation)
12. [Tradeoffs & Enterprise Scalability Analysis](#12-tradeoffs--enterprise-scalability-analysis)
13. [Step-by-Step Implementation Roadmap](#13-step-by-step-implementation-roadmap)
14. [Extra Considerations for Library Development](#14-extra-considerations-for-library-development)

---

## 1. Executive Architecture Overview

### What we are building

A **private, enterprise-grade React component library** (Design System) that:

- Ships as a **scoped npm package** (`@org/ui-library`) consumed via `npm install`.
- Is **tree-shakeable**: consumers only pay for components they import.
- Bundles per-component CSS that is auto-injected on import (no manual stylesheet inclusion).
- Provides a living documentation site via **Storybook 10**.
- Enforces design tokens globally so every component is themeable.
- Wraps selected **PrimeReact** primitives internally while exposing **only** our own API surface.
- Runs quality gates (lint, format, type-check, test) on every commit via **Husky + lint-staged**.
- Publishes automatically through **CI/CD** on Azure DevOps or GitHub Actions.
- Supports **dark mode**, **responsive tokens**, and **brand theming** from day one.

### Technology selection rationale (one-liner each)

| Tool | Why |
|---|---|
| **React 19.2** | Latest stable; `ref` as prop removes `forwardRef` boilerplate; Server Components ready. |
| **Vite 7.2** | Fastest DX via native ESM + esbuild; production builds via Rollup; library mode built-in. |
| **Storybook 10.2** | ESM-only, Vite builder, `defineMain`/`definePreview` type-safe API, built-in Vitest addon. |
| **TypeScript 5.9** | Strict types, declaration emit, path aliases, `satisfies` operator, decorator metadata. |
| **Vitest 4.0** | Vite-native test runner; shares the same config/transform pipeline; browser mode stable. |
| **ESLint 9 flat config** | Single `eslint.config.mts` file; composable arrays; no more `.eslintrc` cascade confusion. |
| **Prettier** | Opinionated formatter; ends style debates; integrates with ESLint via `eslint-config-prettier`. |
| **Husky 9.1** | Zero-config Git hooks via `core.hooksPath`; `npx husky init` scaffolds everything. |
| **Stylelint 16** | ESM-native; SCSS support via `stylelint-config-standard-scss`; enforces design token usage. |
| **PostCSS** | Autoprefixer + nesting; runs after Sass; ensures cross-browser compatibility. |
| **SCSS (Dart Sass)** | Variables, mixins, nesting, `@use`/`@forward` module system; compiles to standard CSS. |
| **Changesets** | Semantic versioning automation; changeset files per PR; auto-generates CHANGELOG. |

### High-level data flow

```
Developer writes component
  → TypeScript + SCSS source in src/components/Button/
    → Vite library mode compiles
      → Rollup bundles ESM + CJS
        → vite-plugin-dts emits .d.ts
          → vite-plugin-lib-inject-css injects per-component CSS imports
            → npm publish to private registry
              → Consumer app: npm install @org/ui-library
                → import { Button } from '@org/ui-library'
                  → CSS auto-loaded, tree-shaking removes unused components
```

---

## 2. Folder Structure Justification

```
ui-library/
├── .storybook/
│   ├── main.ts              # Storybook config (defineMain)
│   ├── preview.ts            # Global decorators, theme provider (definePreview)
│   └── manager.ts            # Storybook UI customization (optional)
├── .husky/
│   ├── pre-commit            # lint-staged trigger
│   └── commit-msg            # commitlint trigger
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx            # Component implementation
│   │   │   ├── button.scss           # Component-scoped styles
│   │   │   ├── Button.stories.tsx    # Storybook stories (CSF Factories)
│   │   │   ├── Button.test.tsx       # Vitest unit/interaction tests
│   │   │   ├── button.types.ts       # TypeScript interfaces/types
│   │   │   ├── button.utils.ts       # Component-specific helpers
│   │   │   ├── button.constants.ts   # Magic strings, enums, defaults
│   │   │   └── index.ts             # Public barrel export
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx         # Wraps PrimeReact DataTable internally
│   │   │   ├── datatable.scss
│   │   │   ├── DataTable.stories.tsx
│   │   │   ├── datatable.types.ts    # Our own API types (NOT PrimeReact's)
│   │   │   └── index.ts
│   │   └── ...
│   ├── design-tokens/
│   │   ├── _variables.scss           # Core SCSS variables ($color-primary, $spacing-md)
│   │   ├── _typography.scss          # Font families, sizes, weights
│   │   ├── _breakpoints.scss         # Responsive breakpoints
│   │   ├── _colors.scss              # Color palette (light + dark)
│   │   ├── _shadows.scss             # Elevation tokens
│   │   ├── _z-index.scss             # Z-index scale
│   │   ├── _animations.scss          # Transition durations, easings
│   │   └── index.scss               # Aggregates all token files via @forward
│   ├── hooks/
│   │   ├── useTheme.ts              # Theme context hook
│   │   ├── useMediaQuery.ts         # Responsive hook
│   │   └── index.ts
│   ├── utils/
│   │   ├── cn.ts                    # className merger (clsx + twMerge pattern)
│   │   ├── a11y.ts                  # Accessibility helpers
│   │   └── index.ts
│   ├── styles/
│   │   ├── _global.scss             # CSS reset, base styles
│   │   ├── _mixins.scss             # Reusable SCSS mixins
│   │   ├── _functions.scss          # SCSS functions
│   │   └── index.scss              # @forward aggregator
│   └── index.ts                     # Root barrel: export * from every component
├── dist/                             # Build output (git-ignored)
├── .changeset/                       # Changeset config + pending changesets
│   └── config.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── tsconfig.build.json               # Stricter tsconfig for production build
├── package.json
├── eslint.config.mts
├── .prettierrc.json
├── .prettierignore
├── stylelint.config.mjs
├── postcss.config.mjs
├── .browserslistrc
├── .npmrc                            # Registry config (NO secrets)
├── .npmignore                        # Or use "files" in package.json
├── .gitignore
├── CHANGELOG.md                      # Auto-generated by changesets
├── README.md
└── LICENSE
```

### Why this structure?

**Component co-location**: Every file related to a component lives in its own folder. When a developer opens `Button/`, they see implementation, styles, stories, tests, types, utils, and constants together. This eliminates cross-folder hunting and makes deletion/refactoring trivial — delete the folder, remove the barrel export, done.

**Barrel exports (`index.ts`)**: Each component folder has an `index.ts` that re-exports only the public API. The root `src/index.ts` re-exports from all component barrels. This gives consumers a clean import path (`@org/ui-library`) while keeping internals hidden.

**design-tokens/ separated from styles/**: Tokens are the single source of truth for the visual language. They are imported by components and by the global stylesheet. Keeping them separate makes it possible for non-component consumers (e.g., a marketing site) to import just the tokens.

**hooks/ and utils/ at the src root**: These are shared across components. Placing them at the component level would cause duplication.

**.storybook/ at root**: Storybook's convention. The `main.ts` discovers stories via glob patterns matching `src/**/*.stories.tsx`.

**Separate tsconfig.build.json**: The main `tsconfig.json` includes stories, tests, and dev tooling. The build tsconfig excludes them so they don't end up in the `dist/` folder.

---

## 3. Architecture-Level Deep Research

### 3.1 Why Vite over standalone Rollup?

**Argument for Vite:**

Vite is not a replacement for Rollup — it **wraps** Rollup for production builds while adding an entirely separate dev experience powered by native ES modules and esbuild. When building a component library, you need two things:

1. **Fast feedback loop during development** — Storybook + hot module replacement.
2. **Optimized production bundle** — tree-shakeable, minified, with declarations.

Standalone Rollup gives you (2) but not (1). You would need to configure a separate dev server, which means maintaining two toolchains. Vite gives you both in a single `vite.config.ts`.

**Counterargument for Rollup:**

Pure Rollup offers more granular control over every phase of the bundling pipeline. For extremely specialized output requirements (e.g., custom module formats, non-standard resolution), Rollup's plugin API is more transparent because there is no abstraction layer.

**Rebuttal:**

Vite 7 exposes `build.rollupOptions` directly — you get the same granularity when you need it. The abstraction layer is thin and opt-out-able. The 99% case benefits from Vite's conventions; the 1% edge case is still achievable via `rollupOptions`.

**Verdict:** Use Vite. The DX advantage is overwhelming, and the production output is identical since Vite uses Rollup under the hood.

### 3.2 Why library mode?

Vite's `build.lib` configuration tells Vite: "I am building a library to be consumed by other applications, not a standalone app."

This changes several behaviors:

| Behavior | App mode | Library mode |
|---|---|---|
| Entry point | `index.html` | `src/index.ts` (your barrel) |
| External deps | Bundled into the app | Marked as external (not bundled) |
| Output format | Single app bundle | ESM + CJS (dual format) |
| CSS handling | Injected into `<style>` | Extracted to files or injected via imports |
| Code splitting | Route-based | Component-based or single file |

Without library mode, Vite would try to bundle React, ReactDOM, and all peer dependencies into your output — exactly what you do NOT want in a shared library.

### 3.3 Why not Create React App (CRA)?

CRA is **dead**. It has been officially deprecated by the React team since 2023. It:

- Does not support library mode.
- Uses Webpack (slower, more complex config for library output).
- Has no Vite integration.
- Produces app bundles, not library bundles.
- Has not received meaningful updates.

There is zero reason to consider CRA for a component library in 2026.

### 3.4 Why not Next.js?

Next.js is an **application framework**, not a library build tool. It:

- Is designed to produce server-rendered pages and API routes.
- Has its own module resolution, middleware, and routing opinions.
- Does not provide library mode output (ESM/CJS with externals).
- Would force every consumer to also use Next.js (or at least understand its module resolution quirks).

A component library must be **framework-agnostic** at the build level. It should produce standard ES modules that any React app — whether Next.js, Remix, Vite-based, or Webpack-based — can consume. Next.js is a fine choice for building the **documentation site** (if you outgrow Storybook), but not for building the library itself.

### 3.5 CSS strategy: bundled inside JS vs. external files

This is one of the most impactful architectural decisions in a component library.

**Option A: CSS-in-JS (bundled inside JS)**

How it works: CSS is written as JavaScript template literals (styled-components, Emotion, vanilla-extract) and injected into `<style>` tags at runtime.

| Pros | Cons |
|---|---|
| Zero CSS files to manage | Runtime overhead (parsing, injection) |
| Co-located with component logic | Increases JS bundle size |
| Dynamic theming via JS | SSR hydration mismatches possible |
| No class name conflicts | Vendor lock-in to CSS-in-JS library |
| | Consumers MUST have the same CSS-in-JS dep |

**Option B: External CSS files (our choice)**

How it works: SCSS compiles to CSS. Vite extracts CSS per component. `vite-plugin-lib-inject-css` adds `import './button.css'` at the top of each component's JS chunk. When a consumer imports `Button`, their bundler (Vite, Webpack, etc.) automatically includes the CSS.

| Pros | Cons |
|---|---|
| Zero runtime CSS overhead | Consumer's bundler must handle CSS imports |
| Smallest possible JS bundle | Class name conflicts possible (mitigated by BEM/prefixing) |
| Works with SSR out of the box | Theming requires CSS custom properties, not JS |
| No CSS-in-JS dependency | Slightly more complex build config |
| Industry standard for design systems | |

**Why we choose Option B:**

Enterprise design systems (IBM Carbon, Atlassian, Ant Design, Salesforce Lightning) universally ship external CSS. The reasons are:

1. **Performance**: Zero JS parse cost for styles. CSS is streamed and parsed in parallel by the browser.
2. **Caching**: CSS files get separate cache entries. A style change doesn't invalidate the JS cache.
3. **SSR**: No hydration mismatch risk. CSS is available before JavaScript executes.
4. **Consumer flexibility**: Works with any bundler that handles CSS imports (all modern bundlers do).
5. **Debugging**: Developers can inspect real CSS classes in DevTools, not runtime-generated hashes.

**The `vite-plugin-lib-inject-css` approach:**

This plugin solves the "how does the consumer get the CSS?" problem elegantly. After building, each component's JS file starts with:

```js
import './button.css';
```

When the consumer's bundler processes this import, it includes the CSS automatically. The consumer never needs to manually import a stylesheet. This gives us the DX of CSS-in-JS (auto-loading) with the performance of external CSS.

### 3.6 Tree-shaking strategy

Tree-shaking is the process of eliminating dead code (unused exports) from the final bundle. For a component library, this is critical: if a consumer only uses `Button` and `Input`, they should not pay for `DataTable` and `Modal`.

**Requirements for effective tree-shaking:**

1. **ESM output**: Tree-shaking only works with ES modules (`import`/`export`), not CommonJS (`require`/`module.exports`). Our primary output format is ESM.

2. **`sideEffects` in package.json**: Set to `["**/*.css"]`. This tells bundlers: "All JS modules are side-effect-free (safe to remove if unused), but CSS files have side effects (they modify the global DOM when imported)."

3. **No barrel re-export side effects**: Our `src/index.ts` does:
   ```ts
   export { Button } from './components/Button';
   export { Input } from './components/Input';
   ```
   Each export is independent. A bundler can safely remove any unused export.

4. **`preserveModules: true` in Rollup options**: Instead of bundling everything into a single file, Rollup outputs one file per source module. This gives bundlers the finest granularity for tree-shaking.

5. **No circular dependencies**: Circular imports defeat tree-shaking because the bundler cannot determine which parts are safe to remove.

### 3.7 Peer dependencies strategy

**What are peer dependencies?**

Peer dependencies are packages that your library **needs at runtime** but expects the **consumer** to provide. The classic example: `react` and `react-dom`.

**Why not regular dependencies?**

If we listed `react` as a regular dependency, npm would install a separate copy of React inside `node_modules/@org/ui-library/node_modules/react`. The consumer's app would then have **two copies of React** — causing hooks to break, context to not propagate, and bundle size to double.

**Our peer dependency list:**

```json
{
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

**What about PrimeReact?**

This is a nuanced decision. PrimeReact is used **internally** by some of our components (e.g., DataTable wraps PrimeReact's DataTable). We have two options:

| Option | Pros | Cons |
|---|---|---|
| **PrimeReact as peer dep** | Consumer controls the version; no duplication | Consumer must install PrimeReact even if they only use non-PrimeReact components |
| **PrimeReact as regular dep** | Consumer doesn't need to know about PrimeReact | Risk of version conflicts if consumer also uses PrimeReact |

**Recommendation:** Make PrimeReact a **regular dependency** and mark it as `external` in the Vite build. This way:
- It is not bundled into our output (no duplication).
- It is listed in `dependencies` so npm auto-installs it for consumers.
- Consumers who also use PrimeReact directly can use npm's deduplication (`npm dedupe`) to share a single copy.

If you want to avoid forcing PrimeReact on consumers who only use simple components (Button, Input), consider splitting into two packages: `@org/ui-core` (no PrimeReact) and `@org/ui-data` (PrimeReact-based). This is the monorepo approach discussed below.

### 3.8 Bundle format: ESM, CJS, UMD — which and why

| Format | Target | Tree-shakeable | Use case |
|---|---|---|---|
| **ESM** (`import`/`export`) | Modern bundlers (Vite, Webpack 5, Rollup) | Yes | Primary format. All modern apps use this. |
| **CJS** (`require`/`module.exports`) | Legacy Node.js, older Webpack, Jest (without ESM) | No | Compatibility fallback. Needed for some testing setups and SSR. |
| **UMD** (Universal Module Definition) | `<script>` tag in browser, AMD loaders | No | Almost never needed for enterprise internal libraries. |

**Our decision:** Ship **ESM + CJS**. Skip UMD.

- ESM is the primary format. It enables tree-shaking, is the standard for modern JavaScript, and is what Vite/Webpack/Rollup consume.
- CJS is a fallback for legacy environments. Some enterprise apps still use older tooling or run Jest without ESM transforms.
- UMD is unnecessary because our library is consumed via npm install, not via `<script>` tags. UMD adds bundle size and complexity for zero benefit in our use case.

### 3.9 Scoped package vs internal registry

**Scoped package** (`@org/ui-library`):

- Published to a private registry (GitHub Packages or Azure Artifacts).
- Consumers configure their `.npmrc` to point to the private registry for the `@org` scope.
- Standard npm workflow: `npm install @org/ui-library`.

**Unscoped package** (`ui-library`):

- Requires a fully private registry (Verdaccio, Artifactory) or careful access controls.
- Risk of name collision with public npm packages.
- No namespace for organizational identity.

**Verdict:** Always use scoped packages. They provide namespace isolation, make `.npmrc` scope-based registry mapping trivial, and are the industry standard for internal packages.

### 3.10 Monorepo vs single package

**Single package:**

One repo, one `package.json`, one npm package. All components live in `src/components/`.

| Pros | Cons |
|---|---|
| Simple setup | Large package if component count grows (100+) |
| Single version to manage | Consumers install everything even if they use 10% |
| Easy CI/CD | PrimeReact dependency forced on all consumers |
| Lower cognitive overhead | Longer build times as library grows |

**Monorepo (e.g., Turborepo/pnpm workspaces):**

Multiple packages in one repo: `packages/core`, `packages/data`, `packages/icons`, etc.

| Pros | Cons |
|---|---|
| Consumers install only what they need | Complex workspace setup |
| Independent versioning per package | Changesets must coordinate across packages |
| Smaller install footprint | More CI/CD complexity |
| PrimeReact isolated to `@org/ui-data` | Cross-package testing is harder |

**Recommendation for starting out:** **Start with a single package.** You can always split later when component count exceeds ~50 or when the PrimeReact dependency isolation becomes a real pain point. Premature monorepo setup adds complexity without proportional benefit for small teams.

**When to migrate to monorepo:** When you have (a) more than 50 components, (b) multiple teams owning different component domains, or (c) consumers explicitly requesting smaller install footprints.

### 3.11 Scalability concerns

| Concern | Mitigation |
|---|---|
| Build time grows with component count | `preserveModules` + parallel compilation. Vite 7's Rolldown integration will further speed this up. |
| Storybook becomes slow | Lazy story loading, Storybook's `refs` to split docs across instances. |
| CSS specificity wars | BEM naming + component prefix (`ui-btn`, `ui-input`). No global selectors except reset. |
| Too many contributors | `CODEOWNERS` file per component folder. PR reviews required from component owner. |
| Consumers on different React versions | Peer dep range `^19.0.0`. Strict lower bound, flexible patch/minor. |
| Design token drift | Stylelint rule to forbid raw color values (`color: #fff` → error, must use `$color-white`). |

### 3.12 Versioning strategy

**SemVer** (Semantic Versioning) is non-negotiable for enterprise libraries:

- **MAJOR** (2.0.0): Breaking API change (renamed prop, removed component, changed behavior).
- **MINOR** (1.1.0): New component, new prop, new feature — backward compatible.
- **PATCH** (1.0.1): Bug fix, style correction, documentation fix.

**Changesets for automation:**

[Changesets](https://github.com/changesets/changesets) is the standard tool for managing versions in JS libraries. The workflow:

1. Developer creates a PR with code changes.
2. Developer runs `npx changeset` and selects the version bump type (patch/minor/major) with a human-readable description.
3. This creates a markdown file in `.changeset/` describing the change.
4. On merge to `main`, the Changesets GitHub Action:
   - Collects all pending changeset files.
   - Bumps `package.json` version.
   - Updates `CHANGELOG.md`.
   - Creates a "Version Packages" PR.
5. Merging the "Version Packages" PR triggers the publish pipeline.

**Why not `npm version` + manual tags?**

- No changelog automation.
- Requires discipline (easily forgotten).
- Does not aggregate multiple changes into a single version bump.
- No concept of "pending changes waiting for release."

### 3.13 Performance implications

| Decision | Performance impact |
|---|---|
| ESM output + `preserveModules` | Enables tree-shaking: consumers only load what they use. |
| External CSS (not CSS-in-JS) | Zero runtime style computation. CSS parsed by browser engine natively. |
| Peer deps externalized | Library JS is ~10-50KB instead of ~500KB+ (no React/ReactDOM bundled). |
| SCSS → CSS at build time | No runtime Sass compilation. Production CSS is static. |
| Per-component CSS injection | Only Button's CSS loads when only Button is imported. |
| `sideEffects: ["**/*.css"]` | Bundler aggressively removes unused JS while preserving CSS. |

---

## 4. Private Hosting Strategy — Deep Comparison

### 4.1 All possible hosting options

#### GitHub Options

**A) GitHub Packages (npm registry)**

GitHub provides a full npm-compatible registry at `https://npm.pkg.github.com`. Packages are scoped to your GitHub organization.

```
# .npmrc (project-level)
@your-org:registry=https://npm.pkg.github.com
```

| Aspect | Details |
|---|---|
| Authentication | Personal Access Token (PAT) with `read:packages` / `write:packages` scope, or `GITHUB_TOKEN` in Actions |
| Access control | Repository-level: public, internal (org), or private |
| Cost | Free for public repos. Private repos: included in GitHub plan (GitHub Team/Enterprise) |
| CI integration | Native with GitHub Actions. `GITHUB_TOKEN` auto-available. |
| Developer experience | Familiar npm workflow. `npm install @org/package` just works after `.npmrc` setup. |
| Versioning | Standard npm semver. Immutable versions (cannot overwrite). |
| Limitations | Must be scoped to GitHub org/user. Cannot publish unscoped packages. |

**B) GitHub Releases tarball**

Attach a `.tgz` tarball to a GitHub Release. Consumers install via:

```bash
npm install https://github.com/org/repo/releases/download/v1.0.0/ui-library-1.0.0.tgz
```

| Aspect | Details |
|---|---|
| Authentication | Repository access (SSH key or PAT) |
| Access control | Repository visibility (public/private) |
| Cost | Free |
| CI integration | Manual: build → `gh release create` → upload tarball |
| Developer experience | Poor. No semver resolution, no `npm update`, manual URL management. |
| Versioning | Tag-based. No npm registry metadata. |
| Limitations | No dependency resolution. No `npm outdated` support. |

**C) GitHub as dependency (git+ssh)**

```json
{
  "dependencies": {
    "@org/ui-library": "git+ssh://git@github.com:org/ui-library.git#v1.0.0"
  }
}
```

| Aspect | Details |
|---|---|
| Authentication | SSH key on developer machine |
| Access control | Repository access |
| Cost | Free |
| CI integration | Requires SSH key in CI environment |
| Developer experience | Slow installs (clones entire repo). No registry features. |
| Versioning | Git tags. No semver range resolution. |
| Limitations | Installs source, not built output (unless you commit `dist/`). Very slow. |

**D) GitHub Actions for publishing**

Not a hosting option itself, but the CI mechanism to publish to any of the above (or to Azure Artifacts).

#### Azure Options

**E) Azure Artifacts (npm feed)**

Azure Artifacts provides a full npm-compatible feed inside Azure DevOps.

```
# .npmrc (project-level)
@your-org:registry=https://pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/registry/
always-auth=true
```

| Aspect | Details |
|---|---|
| Authentication | PAT (Base64-encoded) or `vsts-npm-auth` (Windows) or service connection in pipelines |
| Access control | Feed-level permissions: Owner, Contributor, Reader. Supports AD groups. |
| Cost | Free tier: 2 GB storage. Paid: part of Azure DevOps plan. |
| CI integration | Native with Azure Pipelines. `npmAuthenticate@0` task handles auth. |
| Developer experience | Familiar npm workflow after `.npmrc` setup. `vsts-npm-auth` simplifies Windows auth. |
| Versioning | Standard npm semver. Supports upstream sources (proxy to npmjs.com for public deps). |
| Upstream sources | Can proxy npmjs.com — act as a single registry for both private and public packages. |

**F) Azure DevOps Pipeline publish**

The CI mechanism to build and publish to Azure Artifacts. Uses `npm publish` with `npmAuthenticate@0`.

**G) Azure + GitHub hybrid**

Code lives on GitHub. CI/CD runs on Azure Pipelines. Packages published to Azure Artifacts. This is common in enterprises that use GitHub for source control but Azure DevOps for project management and artifact hosting.

### 4.2 Comparison matrix

| Criteria | GitHub Packages | Azure Artifacts | Git tarball / git+ssh |
|---|---|---|---|
| **npm compatibility** | Full | Full | Partial / None |
| **Tree-shaking support** | Yes (standard npm) | Yes (standard npm) | No (source install) |
| **Semver resolution** | Yes | Yes | No |
| **`npm outdated` support** | Yes | Yes | No |
| **Upstream proxy (npmjs)** | No | Yes | N/A |
| **Access control granularity** | Repo-level | Feed-level + AD groups | Repo-level |
| **SSO/SAML integration** | GitHub Enterprise | Azure AD | N/A |
| **CI auth complexity** | Low (`GITHUB_TOKEN`) | Medium (PAT or service connection) | High (SSH keys) |
| **Local dev auth setup** | PAT in `.npmrc` | PAT or `vsts-npm-auth` | SSH key |
| **Cost** | Included in GitHub plan | Free 2GB, then pay | Free |
| **Multi-feed isolation** | Per-repo or per-org | Per-project, per-feed | N/A |
| **Audit trail** | GitHub audit log | Azure DevOps audit | Git log only |
| **Retention policies** | Manual cleanup | Configurable retention | N/A |
| **Enterprise recommendation** | Good for GitHub-centric orgs | Good for Azure-centric orgs | Not recommended |

### 4.3 Recommendation

**If your org is primarily on GitHub:** Use **GitHub Packages**. The `GITHUB_TOKEN` integration with Actions is seamless, and the `.npmrc` setup is minimal.

**If your org is primarily on Azure DevOps:** Use **Azure Artifacts**. The upstream proxy feature is a killer feature — you get a single `.npmrc` registry for both private and public packages, simplifying developer setup and improving install reliability (cached public packages).

**If you use both (GitHub for code, Azure for project management):** Use **Azure Artifacts** for hosting (upstream proxy is too valuable) and **GitHub Actions** for CI/CD (triggers on PR/push to GitHub).

### 4.4 Authentication setup examples

#### GitHub Packages

**Project `.npmrc` (committed to repo, no secrets):**
```ini
@your-org:registry=https://npm.pkg.github.com
```

**User-level `~/.npmrc` (on developer machine, NOT committed):**
```ini
//npm.pkg.github.com/:_authToken=ghp_YOUR_PERSONAL_ACCESS_TOKEN
```

**`package.json` publishConfig:**
```json
{
  "publishConfig": {
    "@your-org:registry": "https://npm.pkg.github.com"
  }
}
```

**GitHub Actions (CI publishing):**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
    registry-url: https://npm.pkg.github.com/
    scope: '@your-org'
- run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Azure Artifacts

**Project `.npmrc` (committed to repo, no secrets):**
```ini
@your-org:registry=https://pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/registry/
always-auth=true
```

**User-level `~/.npmrc` (on developer machine, NOT committed):**
```ini
; Generate a PAT in Azure DevOps with Packaging (Read & Write) scope
; Base64 encode the PAT: [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("PAT_VALUE"))
//pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/registry/:username=anything
//pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/registry/:_password=BASE64_PAT
//pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/registry/:email=you@company.com
//pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/:username=anything
//pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/:_password=BASE64_PAT
//pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/:email=you@company.com
```

**Windows shortcut (uses Azure AD auth):**
```bash
npx vsts-npm-auth -config .npmrc
```

**Azure Pipelines (CI publishing):**
```yaml
steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '22.x'
  - task: npmAuthenticate@0
    inputs:
      workingFile: .npmrc
  - script: npm publish
```

---

## 5. Vite Build Configuration — Deep Dive

### 5.1 Conceptual overview

Vite's library mode (`build.lib`) tells the build system:

1. **Entry point** is a TypeScript/JavaScript file (not `index.html`).
2. **Output formats** are ESM and/or CJS (not a single app bundle).
3. **External dependencies** (React, etc.) are not bundled — they become `import` statements in the output.
4. **CSS** is extracted per-component (with `vite-plugin-lib-inject-css`).
5. **Type declarations** (`.d.ts`) are generated alongside JS (with `vite-plugin-dts`).

### 5.2 Full `vite.config.ts` with annotations

```ts
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
  plugins: [
    // React plugin: enables JSX transform, Fast Refresh in dev mode.
    // Uses the automatic JSX runtime (no need to import React in every file).
    react(),

    // Generates .d.ts declaration files from TypeScript source.
    // - insertTypesEntry: adds a "types" entry in package.json exports automatically.
    // - include: only process files in src/ (exclude stories, tests).
    // - tsconfigPath: uses the stricter build-specific tsconfig.
    // - rollupTypes: if true, rolls all declarations into a single file (optional).
    //   Set to false for preserveModules to maintain per-file declarations.
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      include: ['src'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.test.tsx',
        'src/**/*.test.ts',
        'src/**/*.spec.tsx',
        'src/**/*.spec.ts',
      ],
      rollupTypes: false,
      insertTypesEntry: true,
    }),

    // Injects CSS import statements at the top of each JS chunk.
    // After build, Button.js will contain: import './button.css';
    // This ensures consumers get CSS automatically when they import a component.
    libInjectCss(),
  ],

  // SCSS configuration: makes design tokens available in every .scss file
  // without requiring manual @use imports in each component.
  css: {
    preprocessorOptions: {
      scss: {
        // Prepend design token imports to every SCSS file.
        // Uses the modern Sass API (api: 'modern-compiler' is default in Vite 7).
        additionalData: `
          @use "@/design-tokens" as tokens;
          @use "@/styles/mixins" as mixins;
        `,
        // Enable the modern Sass API for better performance.
        api: 'modern-compiler',
      },
    },
    // PostCSS is auto-detected from postcss.config.mjs in project root.
  },

  resolve: {
    alias: {
      // Path alias: @ maps to src/ for clean imports in SCSS and TS.
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    // --- Library mode configuration ---
    lib: {
      // The main entry point. Vite starts bundling from here.
      // This should be the root barrel that re-exports all public components.
      entry: resolve(__dirname, 'src/index.ts'),

      // Output format(s). ESM is primary, CJS for legacy compatibility.
      formats: ['es', 'cjs'],

      // File naming convention for output files.
      // [name] = module name (from preserveModules directory structure).
      // [format] = 'es' or 'cjs'.
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'cjs';
        return `${entryName}.${ext}`;
      },
    },

    // --- Rollup-specific options ---
    rollupOptions: {
      // External dependencies: these are NOT bundled into the output.
      // They become import/require statements that the consumer's bundler resolves.
      // Rule: externalize everything in peerDependencies + dependencies.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        // If PrimeReact is a dependency (not bundled):
        /^primereact\/.*/,
        /^primeicons/,
      ],

      output: {
        // --- preserveModules: the KEY decision for tree-shaking ---
        //
        // When true: Rollup outputs one file per source module.
        //   src/components/Button/Button.tsx → dist/components/Button/Button.mjs
        //   src/components/Input/Input.tsx   → dist/components/Input/Input.mjs
        //
        // When false: Rollup bundles everything into a single (or few) file(s).
        //   All components → dist/index.mjs (one big file)
        //
        // For a component library, preserveModules = true is STRONGLY recommended:
        //   1. Consumers get per-component tree-shaking even with naive bundlers.
        //   2. CSS injection is per-component (each component gets its own .css file).
        //   3. Source maps are easier to debug (1:1 source-to-output mapping).
        //
        // The tradeoff: more files in dist/ (hundreds for large libraries).
        // This is acceptable — npm handles it fine, and it's what consumers want.
        preserveModules: true,

        // Strip the 'src/' prefix from output paths.
        // Without this: dist/src/components/Button/Button.mjs
        // With this:    dist/components/Button/Button.mjs
        preserveModulesRoot: 'src',

        // Global variable mappings for UMD builds (not needed for ESM/CJS,
        // but required by Rollup if UMD is ever added).
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },

        // Ensure CSS file names are stable (not content-hashed) for caching predictability.
        assetFileNames: 'assets/[name][extname]',

        // Ensure chunk file names preserve module names.
        chunkFileNames: '[name].mjs',
      },
    },

    // Generate source maps for debugging.
    // 'hidden' = source maps are generated but not referenced in the output files.
    // Useful for error monitoring tools (Sentry) without exposing maps to end users.
    sourcemap: true,

    // CSS code splitting: when true, each async chunk gets its own CSS file.
    // Combined with preserveModules + libInjectCss, each component gets isolated CSS.
    cssCodeSplit: true,

    // Minification: 'esbuild' is fastest. 'terser' is more aggressive but slower.
    // For a library, esbuild minification is sufficient.
    minify: 'esbuild',

    // Target environment: aligns with browserslist config.
    // Vite uses esbuild for transpilation to this target.
    target: 'es2020',

    // Empty the output directory before each build.
    emptyOutDir: true,

    // Report compressed gzip sizes after build.
    reportCompressedSize: true,
  },
});
```

### 5.3 Key Rollup options explained in depth

#### `external`

```ts
external: [
  'react',
  'react-dom',
  'react/jsx-runtime',
  /^primereact\/.*/,
]
```

**What it does:** Any import matching these patterns is left as-is in the output. The output JS will contain `import { useState } from 'react'` — it will NOT inline React's source code.

**Why:** Consumers already have React in their app. Bundling React into our library would mean two copies of React at runtime, breaking hooks and increasing bundle size by ~120KB.

**Best practice:** Externalize everything in `peerDependencies` AND `dependencies`. Only your own source code should be in the output.

**Advanced pattern — auto-externalize from package.json:**

```ts
import pkg from './package.json' assert { type: 'json' };

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
].map(dep => new RegExp(`^${dep}(/.*)?$`));
```

This regex pattern externalizes both `primereact` and `primereact/button` (deep imports).

#### `preserveModules` vs single bundle

| Aspect | `preserveModules: true` | `preserveModules: false` |
|---|---|---|
| Output files | One per source module | Single (or few) bundle(s) |
| Tree-shaking | Excellent (per-file granularity) | Depends on consumer's bundler |
| CSS isolation | Each component gets its own .css | All CSS in one file |
| Source maps | 1:1 mapping | Less granular |
| npm package size | More files, same total size | Fewer files |
| Consumer debugging | Easy (clear file boundaries) | Harder (all code in one file) |

**Our choice: `preserveModules: true`** — the tree-shaking and CSS isolation benefits are decisive for a component library.

#### `cssCodeSplit`

When `true`, CSS is split into separate files per entry/chunk rather than being concatenated into a single `style.css`. Combined with `preserveModules` and `libInjectCss`, this means:

- `Button.mjs` → imports `button.css`
- `Input.mjs` → imports `input.css`
- Consumer imports only `Button` → only `button.css` is loaded

#### Excluding stories and tests from build

Stories and tests must NOT end up in the `dist/` folder. We handle this at multiple levels:

1. **`tsconfig.build.json`** excludes them from TypeScript compilation.
2. **`vite-plugin-dts` `exclude`** prevents `.d.ts` generation for stories/tests.
3. **Rollup's natural behavior**: since stories/tests are not reachable from `src/index.ts` (the entry point), they are never included in the bundle. The entry point only exports production components.

### 5.4 `tsconfig.build.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "noEmit": false
  },
  "include": ["src"],
  "exclude": [
    "src/**/*.stories.tsx",
    "src/**/*.stories.ts",
    "src/**/*.test.tsx",
    "src/**/*.test.ts",
    "src/**/*.spec.tsx",
    "src/**/*.spec.ts",
    "**/__mocks__/**",
    "**/__tests__/**"
  ]
}
```

### 5.5 `tsconfig.json` (main — includes everything for IDE support)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", ".storybook"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 6. Tooling Deep Dives with Actual Code

### 6.1 ESLint (v9.39+ — Flat Config)

#### Why we use it

ESLint catches bugs, enforces coding standards, and prevents anti-patterns **before** code reaches review. In a design system used by many teams, consistency is critical — one contributor's `any` type or unused import becomes every consumer's tech debt.

#### What problem it solves

- Catches type errors that TypeScript's `strict` mode doesn't (e.g., rules of hooks).
- Enforces import ordering for readability.
- Prevents accidental `console.log` in production.
- Ensures React hooks are used correctly (dependency arrays, conditional calls).

#### Why not alternatives (Biome/Rome)?

Biome is fast and promising, but as of 2026 it still lacks some TypeScript-specific rules, ecosystem plugin breadth (no custom React hooks rule parity), and Storybook integration. ESLint's ecosystem is vastly larger. We revisit Biome annually.

#### Integration with Vite

ESLint does NOT run during Vite's build or dev server by default (and it shouldn't — it would slow down HMR). Instead:

- Runs via `lint-staged` on pre-commit (Husky).
- Runs in CI as a dedicated step.
- Runs in the IDE in real-time (VS Code ESLint extension).

#### Full `eslint.config.mts`

```ts
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybookPlugin from 'eslint-plugin-storybook';
import globals from 'globals';

export default tseslint.config(
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'storybook-static/**',
      'coverage/**',
      '*.config.*',
    ],
  },

  // Base recommended rules
  js.configs.recommended,

  // TypeScript strict rules (includes type-aware linting)
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // TypeScript parser options (required for type-aware rules)
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
  },

  // React Hooks rules
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // React Refresh (for Vite HMR — only in dev)
  {
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

  // Project-specific rules
  {
    rules: {
      // Allow underscore-prefixed unused vars (common pattern for destructuring)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Enforce consistent type imports (better tree-shaking)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Warn on console.log (allow warn and error)
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Prevent default exports (barrel re-exports work better with named exports)
      // Exception: Storybook stories and config files use default exports
      'no-restricted-exports': [
        'error',
        { restrictDefaultExports: { direct: false } },
      ],
    },
  },

  // Storybook-specific rules (only apply to story files)
  {
    files: ['**/*.stories.@(ts|tsx|js|jsx|mjs)'],
    plugins: {
      storybook: storybookPlugin,
    },
    rules: {
      ...storybookPlugin.configs.recommended.rules,
      // Stories are allowed to use default exports (CSF requires it in CSF3)
      'no-restricted-exports': 'off',
      // Stories can have non-component exports (meta, args)
      'react-refresh/only-export-components': 'off',
    },
  },

  // Test files: relax some strict rules
  {
    files: ['**/*.test.@(ts|tsx)', '**/*.spec.@(ts|tsx)'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
);
```

### 6.2 Prettier

#### Why we use it

Prettier is an **opinionated code formatter** that eliminates all style debates (tabs vs spaces, semicolons, quote style). It formats code on save, on commit, and in CI.

#### What problem it solves

Without Prettier, code reviews devolve into style nitpicking. With Prettier, formatting is automated and deterministic — the same input always produces the same output.

#### Why not alternatives?

- **ESLint formatting rules**: ESLint's formatting rules (now deprecated) were slower and less comprehensive. The ESLint team officially recommends Prettier.
- **Biome formatter**: Fast, but less ecosystem integration. Doesn't format SCSS, JSON, Markdown.
- **dprint**: Fast Rust-based formatter, but less community adoption and plugin support.

#### Integration with ESLint

We use `eslint-config-prettier` to **disable** ESLint rules that conflict with Prettier. This way, ESLint handles logic/quality rules, Prettier handles formatting. No conflicts.

Install: `npm install -D eslint-config-prettier`

Add to `eslint.config.mts`:
```ts
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // ... other configs ...
  prettierConfig, // Must be LAST to override conflicting rules
);
```

#### Full `.prettierrc.json`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "jsxSingleQuote": false,
  "quoteProps": "as-needed",
  "htmlWhitespaceSensitivity": "css",
  "singleAttributePerLine": true
}
```

#### `.prettierignore`

```
dist/
node_modules/
storybook-static/
coverage/
CHANGELOG.md
pnpm-lock.yaml
package-lock.json
```

### 6.3 Husky (v9.1)

#### Why we use it

Husky configures **Git hooks** that run automatically on `git commit` and `git push`. This catches issues **before** they reach CI, saving time and preventing broken commits.

#### What problem it solves

Without Git hooks, a developer can commit unlinted, unformatted, failing code. CI will catch it, but the feedback loop is 5-10 minutes instead of 5 seconds. Husky makes the feedback instant.

#### How it works

Husky sets Git's `core.hooksPath` to `.husky/`. When you run `git commit`, Git looks in `.husky/` for a `pre-commit` script and executes it.

#### Setup

```bash
# Install
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# Initialize (creates .husky/ directory and adds prepare script)
npx husky init
```

#### `.husky/pre-commit`

```sh
npx lint-staged
```

#### `.husky/commit-msg`

```sh
npx --no -- commitlint --edit $1
```

#### `lint-staged` configuration in `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ],
    "*.scss": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

**How lint-staged works:** It receives the list of staged files (files added to the Git staging area) and runs the specified commands **only on those files**. This means linting 3 changed files takes ~1 second, not 30 seconds for the entire codebase.

#### `commitlint.config.mjs`

```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Formatting (no code change)
        'refactor', // Code change that neither fixes nor adds
        'perf',     // Performance improvement
        'test',     // Adding/correcting tests
        'build',    // Build system or external deps
        'ci',       // CI configuration
        'chore',    // Other changes (e.g., dependency bumps)
        'revert',   // Reverts a previous commit
      ],
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'header-max-length': [2, 'always', 100],
  },
};
```

**Conventional Commits format:** `type(scope): description`

Examples:
- `feat(button): add loading state variant`
- `fix(modal): prevent body scroll when open`
- `docs(readme): update installation instructions`

### 6.4 Stylelint (v16)

#### Why we use it

Stylelint is a CSS/SCSS linter that enforces style conventions, catches errors, and — critically for a design system — **prevents developers from using raw values instead of design tokens**.

#### What problem it solves

- Catches invalid CSS property values.
- Enforces consistent ordering of CSS properties.
- Prevents `color: #3b82f6` (raw hex) — forces `color: tokens.$color-primary`.
- Enforces BEM or naming conventions.
- Catches duplicate selectors.

#### Full `stylelint.config.mjs`

```js
export default {
  extends: [
    'stylelint-config-standard-scss',
  ],
  plugins: [
    'stylelint-scss',
  ],
  rules: {
    // Enforce lowercase and dashes for class selectors (BEM-compatible)
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)*(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { message: 'Class names must follow BEM convention (block__element--modifier)' },
    ],

    // Forbid raw color values — force design token usage
    'color-named': 'never',
    'color-no-hex': true,

    // Allow SCSS variables and CSS custom properties for colors
    'declaration-property-value-no-unknown': [
      true,
      {
        ignoreProperties: { color: ['/^\\$/'], 'background-color': ['/^\\$/'] },
      },
    ],

    // Enforce shorthand properties where possible
    'shorthand-property-no-redundant-values': true,

    // Prevent overly specific selectors (max 3 levels deep)
    'selector-max-compound-selectors': 3,
    'selector-max-id': 0,

    // Enforce consistent property ordering
    'order/properties-alphabetical-order': null,

    // SCSS-specific rules
    'scss/at-use-no-unnamespaced': true,
    'scss/dollar-variable-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
    'scss/no-duplicate-mixins': true,

    // Allow @use and @forward (modern Sass module system)
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,

    // Disable rules that conflict with Prettier
    'declaration-block-trailing-semicolon': null,
    'string-quotes': null,
  },

  overrides: [
    {
      files: ['src/styles/_global.scss'],
      rules: {
        'color-no-hex': null,
      },
    },
  ],

  ignoreFiles: ['dist/**', 'node_modules/**', 'storybook-static/**'],
};
```

#### Design token enforcement

The `color-no-hex: true` rule is a game-changer for design systems. It means:

```scss
// ERROR: raw hex color
.button {
  color: #3b82f6; // ✗ Stylelint error: Unexpected hex color
}

// CORRECT: design token
.button {
  color: tokens.$color-primary; // ✓
}

// ALSO CORRECT: CSS custom property
.button {
  color: var(--color-primary); // ✓
}
```

This ensures every color in the library comes from the token system. If a designer changes "primary blue" from `#3b82f6` to `#2563eb`, they change one variable and every component updates.

### 6.5 PostCSS

#### Why we use it

PostCSS processes CSS **after** Sass compilation. It handles:

1. **Autoprefixer**: Adds vendor prefixes (`-webkit-`, `-moz-`) based on the Browserslist config.
2. **Nesting**: Transforms CSS nesting syntax for older browsers (though Sass already handles most nesting).
3. **Modern CSS features**: Polyfills newer CSS features for older browsers.

#### Why not alternatives?

- **Lightning CSS**: Faster than PostCSS, but less plugin ecosystem. Vite 7 supports it as an alternative, but autoprefixer integration is less mature.
- **No PostCSS at all**: Possible if you only target evergreen browsers, but enterprises typically need IE11 or older Safari support.

#### Integration with Vite

Vite auto-detects `postcss.config.mjs` in the project root. No extra Vite configuration needed.

#### Full `postcss.config.mjs`

```js
import autoprefixer from 'autoprefixer';
import postcssNesting from 'postcss-nesting';

export default {
  plugins: [
    // CSS nesting support (W3C spec, edition 2024-02).
    // Only needed for CSS files that bypass Sass (e.g., plain .css files).
    // Sass already compiles nesting, so this is a safety net.
    postcssNesting({
      edition: '2024-02',
    }),

    // Adds vendor prefixes based on browserslist config.
    // e.g., display: flex → display: -webkit-flex; display: flex;
    // Only adds prefixes for browsers in your browserslist.
    autoprefixer(),
  ],
};
```

### 6.6 Browserslist

#### Why we use it

Browserslist defines which browsers your library supports. This config is consumed by:

- **Autoprefixer**: To decide which vendor prefixes to add.
- **Vite/esbuild**: To decide which JS syntax to transpile.
- **Babel** (if used): To decide which polyfills to include.

#### Enterprise browser support

#### `.browserslistrc`

```
# Enterprise target: last 2 versions of evergreen browsers + extended Safari support
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
not dead
not op_mini all
> 0.5%
```

**Why these choices:**

- `last 2 Chrome versions`: Covers the vast majority of enterprise desktops.
- `last 2 Firefox versions`: Required by some government and enterprise policies.
- `last 2 Safari versions`: Covers recent iOS and macOS.
- `last 2 Edge versions`: Chromium-based Edge is standard in Microsoft-centric enterprises.
- `not dead`: Removes browsers without official support or updates.
- `not op_mini all`: Opera Mini has severe limitations (no JS, limited CSS).
- `> 0.5%`: Catches any browser with meaningful global usage.

You can verify what this resolves to:

```bash
npx browserslist
```

---

## 7. Storybook 10+ Architecture

### 7.1 Why Storybook for a design system

Storybook serves as:

1. **Living documentation**: Every component has interactive examples that designers and developers can explore.
2. **Development sandbox**: Developers build components in isolation without needing a full app.
3. **Visual regression baseline**: Stories serve as test cases for visual testing.
4. **Design review tool**: Designers can review components in Storybook without running the app.
5. **Accessibility audit**: The a11y addon scans every story for WCAG violations.

### 7.2 Storybook 10 key changes from v8

| Feature | Storybook 8 | Storybook 10 |
|---|---|---|
| Module system | CJS + ESM | ESM only |
| Config API | `StorybookConfig` type | `defineMain()` / `definePreview()` factories |
| Story format | CSF 3 | CSF Factories (Preview) + CSF 3 backward compatible |
| Testing | Experimental Vitest addon | Stable `@storybook/addon-vitest` |
| Node.js | 16+ | 20.19+ or 22.12+ |
| Addons in preview | String-based | Function-based (`addonA11y()`) |

### 7.3 Full `.storybook/main.ts`

```ts
import { defineMain } from '@storybook/react-vite/node';

export default defineMain({
  // Framework: React with Vite builder (not Webpack)
  framework: '@storybook/react-vite',

  // Story discovery patterns
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
  ],

  // Addons
  addons: [
    // Documentation addon: auto-generates docs pages from stories + JSDoc/TSDoc comments
    '@storybook/addon-docs',

    // Accessibility addon: scans rendered stories with axe-core for WCAG violations
    '@storybook/addon-a11y',

    // Vitest integration: run component tests from within Storybook
    '@storybook/addon-vitest',
  ],

  // Static files directory (for fonts, images referenced in stories)
  staticDirs: ['../public'],

  // TypeScript configuration
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        // Only show props defined in our library, not inherited HTML attributes
        if (prop.declarations && prop.declarations.length > 0) {
          return prop.declarations.some(
            (declaration) => !declaration.fileName.includes('node_modules'),
          );
        }
        return true;
      },
    },
  },

  // Docs configuration
  docs: {
    defaultName: 'Documentation',
  },
});
```

### 7.4 Full `.storybook/preview.ts`

```ts
import { definePreview } from '@storybook/react-vite';
import addonA11y from '@storybook/addon-a11y';
import type { Preview } from '@storybook/react-vite';

// Import global styles so all stories have the design system's base styles
import '../src/styles/index.scss';

const preview = definePreview({
  // Addons configured in preview (for runtime behavior)
  addons: [addonA11y()],

  parameters: {
    // Controls: auto-detect controls from component props
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: 'requiredFirst',
    },

    // Docs page configuration
    docs: {
      toc: true, // Table of contents in docs
    },

    // Accessibility defaults
    a11y: {
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      },
    },

    // Viewport presets for responsive testing
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
    },

    // Layout: centered by default (most components look better centered)
    layout: 'centered',

    // Backgrounds for light/dark mode testing
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a2e' },
        { name: 'gray', value: '#f5f5f5' },
      ],
    },
  },

  // Global decorators: wrap every story with theme provider, global styles, etc.
  decorators: [
    (Story) => (
      <div className="ui-theme-light" style={{ padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],

  // Global arg types: define default arg types for common props
  argTypes: {
    className: { control: 'text', description: 'Additional CSS class name' },
  },

  // Tags for filtering stories
  tags: ['autodocs'],
}) satisfies Preview;

export default preview;
```

### 7.5 Example story using CSF Factories (Storybook 10 syntax)

```tsx
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner',
    },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};
```

### 7.6 Storybook testing vs Vitest — comparison

| Aspect | `@storybook/addon-vitest` (in Storybook) | Vitest standalone |
|---|---|---|
| **Where tests run** | Inside Storybook's browser environment (Playwright) | Node.js (jsdom) or browser mode |
| **Test format** | Stories with `play` functions | Standard test files (`.test.tsx`) |
| **Interaction testing** | First-class (`userEvent` in `play`) | Requires `@testing-library/user-event` |
| **Visual regression** | Chromatic integration | Separate setup needed |
| **Accessibility** | Built-in axe-core scanning | Requires `vitest-axe` or similar |
| **Speed** | Slower (real browser) | Faster (jsdom) or comparable (browser mode) |
| **Coverage** | Supported (v8 provider) | Supported (v8 or istanbul) |
| **CI integration** | `npx vitest --project storybook` | `npx vitest` |
| **Debugging** | Storybook UI with interactive play | Terminal + IDE debugger |
| **Component isolation** | Inherent (stories are isolated) | Requires manual setup |

**When to use each:**

- **Use Storybook tests** for: interaction testing (click, type, submit), accessibility scanning, visual regression, and testing component states that are already documented as stories.
- **Use Vitest standalone** for: unit testing utilities, hooks, pure functions, complex business logic inside components, edge cases not worth documenting as stories.
- **Use both** in a mature design system. Stories test "does it look and behave right?" Vitest tests "does the internal logic work correctly?"

### 7.7 Storybook addon-vitest setup

After running `npx storybook add @storybook/addon-vitest`, the setup creates:

**`.storybook/vitest.setup.ts`** (auto-generated):
```ts
import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as previewAnnotations from './preview';

const annotations = setProjectAnnotations([previewAnnotations]);

beforeAll(annotations.beforeAll);
```

This file ensures your Storybook decorators, parameters, and global config are applied when running stories as Vitest tests.

---

## 8. Testing Architecture

### 8.1 Testing pyramid for a component library

```
              ╱╲
             ╱  ╲         Visual regression (Chromatic/Percy)
            ╱────╲        Few, high-value tests
           ╱      ╲
          ╱        ╲      Integration / Interaction tests
         ╱──────────╲     Stories with play functions
        ╱            ╲
       ╱              ╲   Unit tests
      ╱────────────────╲  Vitest: hooks, utils, logic
     ╱                  ╲
    ╱                    ╲ Static analysis
   ╱──────────────────────╲ TypeScript + ESLint + Stylelint
```

### 8.2 Full `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  test: {
    // Run tests in jsdom environment (simulates browser DOM in Node.js)
    environment: 'jsdom',

    // Setup file: runs before each test file
    setupFiles: ['./src/test-setup.ts'],

    // Include patterns
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', 'storybook-static'],

    // Global test APIs (describe, it, expect) without imports
    globals: true,

    // CSS handling in tests
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
        'src/utils/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.types.ts',
        'src/**/*.constants.ts',
        'src/**/index.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },

  // Storybook integration as a separate Vitest project
  // This allows running: npx vitest --project storybook
  projects: [
    // Default project (unit tests)
    {
      test: {
        name: 'unit',
        include: ['src/**/*.test.{ts,tsx}'],
        environment: 'jsdom',
      },
    },
    // Storybook project (story-based tests)
    {
      plugins: [storybookTest()],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: 'playwright',
          instances: [{ browser: 'chromium' }],
        },
        setupFiles: ['.storybook/vitest.setup.ts'],
      },
    },
  ],
});
```

### 8.3 Test setup file

```ts
// src/test-setup.ts
import '@testing-library/jest-dom/vitest';
```

This adds custom matchers like `toBeInTheDocument()`, `toHaveTextContent()`, etc.

### 8.4 Example unit test

```tsx
// src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies variant class', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('ui-btn--primary');
  });

  it('renders loading state with spinner', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('is accessible', () => {
    render(<Button>Accessible Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeEnabled();
    expect(button).toBeVisible();
  });
});
```

### 8.5 Test scripts in `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:storybook": "vitest run --project storybook",
    "test:all": "vitest run --project unit --project storybook",
    "test:ui": "vitest --ui"
  }
}
```

---

## 9. SCSS Architecture

### 9.1 Design tokens

Design tokens are the **single source of truth** for all visual decisions: colors, spacing, typography, shadows, animations.

#### `src/design-tokens/_variables.scss`

```scss
// ============================================================
// SPACING SCALE (8px base unit)
// ============================================================
$spacing-0: 0;
$spacing-1: 0.25rem;   // 4px
$spacing-2: 0.5rem;    // 8px
$spacing-3: 0.75rem;   // 12px
$spacing-4: 1rem;      // 16px
$spacing-5: 1.25rem;   // 20px
$spacing-6: 1.5rem;    // 24px
$spacing-8: 2rem;      // 32px
$spacing-10: 2.5rem;   // 40px
$spacing-12: 3rem;     // 48px
$spacing-16: 4rem;     // 64px

// ============================================================
// BORDER RADIUS
// ============================================================
$radius-none: 0;
$radius-sm: 0.25rem;   // 4px
$radius-md: 0.5rem;    // 8px
$radius-lg: 0.75rem;   // 12px
$radius-xl: 1rem;      // 16px
$radius-full: 9999px;

// ============================================================
// TRANSITIONS
// ============================================================
$transition-fast: 150ms ease;
$transition-normal: 250ms ease;
$transition-slow: 350ms ease;

// ============================================================
// Z-INDEX SCALE
// ============================================================
$z-dropdown: 1000;
$z-sticky: 1100;
$z-fixed: 1200;
$z-overlay: 1300;
$z-modal: 1400;
$z-popover: 1500;
$z-tooltip: 1600;
$z-toast: 1700;
```

#### `src/design-tokens/_colors.scss`

```scss
// ============================================================
// COLOR PALETTE — Light Theme (default)
// ============================================================
// Using CSS custom properties for runtime theme switching.
// SCSS variables are compile-time; CSS custom properties are runtime.
// We define both: SCSS vars for static analysis/Stylelint, CSS vars for theming.

// Brand colors
$color-primary: #2563eb;
$color-primary-hover: #1d4ed8;
$color-primary-active: #1e40af;
$color-primary-light: #dbeafe;

$color-secondary: #7c3aed;
$color-secondary-hover: #6d28d9;
$color-secondary-active: #5b21b6;

// Semantic colors
$color-success: #16a34a;
$color-success-light: #dcfce7;
$color-warning: #d97706;
$color-warning-light: #fef3c7;
$color-danger: #dc2626;
$color-danger-light: #fee2e2;
$color-info: #0284c7;
$color-info-light: #e0f2fe;

// Neutral palette
$color-white: #ffffff;
$color-gray-50: #f9fafb;
$color-gray-100: #f3f4f6;
$color-gray-200: #e5e7eb;
$color-gray-300: #d1d5db;
$color-gray-400: #9ca3af;
$color-gray-500: #6b7280;
$color-gray-600: #4b5563;
$color-gray-700: #374151;
$color-gray-800: #1f2937;
$color-gray-900: #111827;
$color-black: #000000;

// Semantic assignments
$color-text-primary: $color-gray-900;
$color-text-secondary: $color-gray-600;
$color-text-disabled: $color-gray-400;
$color-text-inverse: $color-white;

$color-bg-primary: $color-white;
$color-bg-secondary: $color-gray-50;
$color-bg-disabled: $color-gray-100;

$color-border-default: $color-gray-200;
$color-border-focus: $color-primary;

// ============================================================
// CSS CUSTOM PROPERTIES (for runtime theming)
// ============================================================
:root,
.ui-theme-light {
  --color-primary: #{$color-primary};
  --color-primary-hover: #{$color-primary-hover};
  --color-primary-active: #{$color-primary-active};
  --color-primary-light: #{$color-primary-light};

  --color-text-primary: #{$color-text-primary};
  --color-text-secondary: #{$color-text-secondary};
  --color-text-disabled: #{$color-text-disabled};
  --color-text-inverse: #{$color-text-inverse};

  --color-bg-primary: #{$color-bg-primary};
  --color-bg-secondary: #{$color-bg-secondary};

  --color-border-default: #{$color-border-default};
  --color-border-focus: #{$color-border-focus};

  --color-success: #{$color-success};
  --color-warning: #{$color-warning};
  --color-danger: #{$color-danger};
  --color-info: #{$color-info};
}

// ============================================================
// DARK THEME OVERRIDES
// ============================================================
.ui-theme-dark {
  --color-primary: #60a5fa;
  --color-primary-hover: #93bbfd;
  --color-primary-active: #3b82f6;
  --color-primary-light: #1e3a5f;

  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-text-disabled: #6b7280;
  --color-text-inverse: #111827;

  --color-bg-primary: #111827;
  --color-bg-secondary: #1f2937;

  --color-border-default: #374151;
  --color-border-focus: #60a5fa;

  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-danger: #f87171;
  --color-info: #38bdf8;
}
```

#### `src/design-tokens/_typography.scss`

```scss
// Font families
$font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif;
$font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace;

// Font sizes (modular scale, ratio ≈ 1.25)
$font-size-xs: 0.75rem;    // 12px
$font-size-sm: 0.875rem;   // 14px
$font-size-base: 1rem;     // 16px
$font-size-lg: 1.125rem;   // 18px
$font-size-xl: 1.25rem;    // 20px
$font-size-2xl: 1.5rem;    // 24px
$font-size-3xl: 1.875rem;  // 30px
$font-size-4xl: 2.25rem;   // 36px

// Font weights
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// Line heights
$line-height-tight: 1.25;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;

// Letter spacing
$letter-spacing-tight: -0.025em;
$letter-spacing-normal: 0;
$letter-spacing-wide: 0.025em;
```

#### `src/design-tokens/_breakpoints.scss`

```scss
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1536px;
```

#### `src/design-tokens/_shadows.scss`

```scss
$shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
$shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
$shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
$shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

#### `src/design-tokens/index.scss` (aggregator)

```scss
@forward 'variables';
@forward 'colors';
@forward 'typography';
@forward 'breakpoints';
@forward 'shadows';
@forward 'animations';
@forward 'z-index';
```

### 9.2 CSS Modules vs Global SCSS

| Approach | Pros | Cons |
|---|---|---|
| **CSS Modules** (`.module.scss`) | Automatic unique class names; zero collision risk | Harder to override in consumer apps; class names are hashed |
| **Global SCSS with BEM** (our choice) | Predictable class names; easy to override; standard | Requires naming discipline; theoretical collision risk |

**Why we choose Global SCSS with BEM:**

Design system consumers need to be able to:
1. **Override styles** in specific contexts (e.g., `Button` inside a `Header`).
2. **Target specific states** (`.ui-btn--loading`).
3. **Debug in DevTools** with readable class names.

CSS Modules hash class names (`_button_1a2b3c`), making all three of these difficult. BEM with a namespace prefix (`ui-btn`) is predictable, debuggable, and overridable.

### 9.3 Mixins and utility classes

#### `src/styles/_mixins.scss`

```scss
@use '../design-tokens' as tokens;

// Responsive breakpoint mixin
@mixin breakpoint($size) {
  @if $size == sm {
    @media (min-width: tokens.$breakpoint-sm) { @content; }
  } @else if $size == md {
    @media (min-width: tokens.$breakpoint-md) { @content; }
  } @else if $size == lg {
    @media (min-width: tokens.$breakpoint-lg) { @content; }
  } @else if $size == xl {
    @media (min-width: tokens.$breakpoint-xl) { @content; }
  }
}

// Focus ring (accessible focus indicator)
@mixin focus-ring($color: var(--color-border-focus)) {
  outline: 2px solid $color;
  outline-offset: 2px;
}

// Visually hidden (accessible screen-reader-only text)
@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Truncate text with ellipsis
@mixin truncate($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// Component prefix helper
@mixin component($name) {
  .ui-#{$name} {
    @content;
  }
}
```

### 9.4 Theming strategy (Light/Dark mode)

Our theming approach uses **CSS custom properties** at the `:root` level, overridden by theme classes:

```
<html class="ui-theme-light">   ← Light theme (default)
<html class="ui-theme-dark">    ← Dark theme
```

**How components use it:**

```scss
// src/components/Button/button.scss
.ui-btn {
  // Use CSS custom properties — automatically adapts to theme
  color: var(--color-text-inverse);
  background-color: var(--color-primary);
  border: 1px solid transparent;
  border-radius: tokens.$radius-md;
  padding: tokens.$spacing-2 tokens.$spacing-4;
  font-family: tokens.$font-family-sans;
  font-size: tokens.$font-size-base;
  font-weight: tokens.$font-weight-medium;
  line-height: tokens.$line-height-normal;
  cursor: pointer;
  transition: all tokens.$transition-fast;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }

  &:active:not(:disabled) {
    background-color: var(--color-primary-active);
  }

  &:focus-visible {
    @include mixins.focus-ring;
  }

  &:disabled {
    color: var(--color-text-disabled);
    background-color: var(--color-bg-disabled);
    cursor: not-allowed;
  }

  // Variants
  &--secondary {
    color: var(--color-text-primary);
    background-color: var(--color-bg-secondary);
    border-color: var(--color-border-default);

    &:hover:not(:disabled) {
      background-color: var(--color-bg-primary);
    }
  }

  &--outline {
    color: var(--color-primary);
    background-color: transparent;
    border-color: var(--color-primary);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-light);
    }
  }

  &--ghost {
    color: var(--color-primary);
    background-color: transparent;
    border-color: transparent;

    &:hover:not(:disabled) {
      background-color: var(--color-primary-light);
    }
  }

  // Sizes
  &--sm {
    padding: tokens.$spacing-1 tokens.$spacing-3;
    font-size: tokens.$font-size-sm;
  }

  &--lg {
    padding: tokens.$spacing-3 tokens.$spacing-6;
    font-size: tokens.$font-size-lg;
  }

  // Loading state
  &--loading {
    position: relative;
    pointer-events: none;
    color: transparent;
  }
}
```

**Why CSS custom properties for theming instead of SCSS variables?**

SCSS variables are compile-time: `$color-primary: blue` is resolved to `blue` during the Sass build. You cannot change it at runtime.

CSS custom properties are runtime: `var(--color-primary)` is resolved by the browser. Changing the `--color-primary` value (via a theme class) instantly updates every component that references it. This is essential for:

1. **Dark mode toggle** without page reload.
2. **Multi-brand theming** (different companies using the same library with different brand colors).
3. **User preference** (high contrast mode).

### 9.5 PrimeReact wrapping strategy

When wrapping PrimeReact components, the goal is to **hide PrimeReact's API** and expose only our design system's API.

```tsx
// src/components/DataTable/DataTable.tsx
import { type FC } from 'react';
import { DataTable as PrimeDataTable } from 'primereact/datatable';
import { Column as PrimeColumn } from 'primereact/column';
import type { DataTableProps } from './datatable.types';
import './datatable.scss';

export const DataTable: FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  sortable = false,
  paginated = false,
  pageSize = 10,
  onRowClick,
  className,
  ...rest
}) => {
  return (
    <div className={`ui-datatable ${className ?? ''}`}>
      <PrimeDataTable
        value={data}
        loading={loading}
        sortMode={sortable ? 'single' : undefined}
        paginator={paginated}
        rows={pageSize}
        onRowClick={onRowClick ? (e) => onRowClick(e.data) : undefined}
        {...rest}
      >
        {columns.map((col) => (
          <PrimeColumn
            key={col.field}
            field={col.field}
            header={col.header}
            sortable={sortable && col.sortable}
            body={col.render}
          />
        ))}
      </PrimeDataTable>
    </div>
  );
};
```

```ts
// src/components/DataTable/datatable.types.ts
export interface DataTableColumn<T = Record<string, unknown>> {
  field: string;
  header: string;
  sortable?: boolean;
  render?: (rowData: T) => React.ReactNode;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  onRowClick?: (rowData: T) => void;
  className?: string;
}
```

```scss
// src/components/DataTable/datatable.scss
// Override PrimeReact's default styles with our design tokens
.ui-datatable {
  .p-datatable {
    font-family: tokens.$font-family-sans;
    border-radius: tokens.$radius-md;
    overflow: hidden;
    border: 1px solid var(--color-border-default);

    .p-datatable-header {
      background-color: var(--color-bg-secondary);
      border-bottom: 1px solid var(--color-border-default);
      padding: tokens.$spacing-4;
    }

    .p-datatable-thead > tr > th {
      background-color: var(--color-bg-secondary);
      color: var(--color-text-secondary);
      font-weight: tokens.$font-weight-semibold;
      font-size: tokens.$font-size-sm;
      padding: tokens.$spacing-3 tokens.$spacing-4;
      border-bottom: 1px solid var(--color-border-default);
    }

    .p-datatable-tbody > tr > td {
      padding: tokens.$spacing-3 tokens.$spacing-4;
      border-bottom: 1px solid var(--color-border-default);
      color: var(--color-text-primary);
      font-size: tokens.$font-size-sm;
    }

    .p-datatable-tbody > tr:hover {
      background-color: var(--color-bg-secondary);
    }

    .p-paginator {
      padding: tokens.$spacing-3;
      border-top: 1px solid var(--color-border-default);
    }
  }
}
```

**Key principles for PrimeReact wrapping:**

1. **Never expose PrimeReact types** in our public API. Our `DataTableProps` is a completely independent interface.
2. **Override PrimeReact CSS** to match our design tokens. Use the `.ui-datatable` wrapper to scope overrides.
3. **Map our API to PrimeReact's API** inside the component. The consumer never knows PrimeReact exists.
4. **Lock PrimeReact version** in `dependencies` (not `peerDependencies`) to prevent unexpected breaking changes.

### 9.6 Global styles

#### `src/styles/_global.scss`

```scss
@use '../design-tokens' as tokens;

// Minimal CSS reset
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: tokens.$font-family-sans;
  font-size: 16px;
  line-height: tokens.$line-height-normal;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// Focus visible: only show focus ring for keyboard navigation
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

// Reduced motion preference
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 10. package.json Best Practices

### Full `package.json` with annotations

```jsonc
{
  // Scoped package name: @org/ prefix is your npm organization scope.
  // This maps to your private registry via .npmrc.
  "name": "@org/ui-library",

  // SemVer version. Managed automatically by Changesets.
  "version": "1.0.0",

  // CRITICAL: "module" tells Node.js and bundlers to treat .js files as ES modules.
  // Without this, import/export syntax in .mjs files would be required.
  "type": "module",

  // Human-readable description for npm registry listing.
  "description": "Enterprise React Design System Component Library",

  // IMPORTANT: "exports" is the modern way to define entry points.
  // It supersedes "main" and "module" for bundlers that support it.
  // This defines EXACTLY what consumers can import and from where.
  "exports": {
    // Main entry: import { Button } from '@org/ui-library'
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    // Per-component entry: import { Button } from '@org/ui-library/components/Button'
    "./components/*": {
      "import": {
        "types": "./dist/components/*/index.d.mts",
        "default": "./dist/components/*/index.mjs"
      },
      "require": {
        "types": "./dist/components/*/index.d.cts",
        "default": "./dist/components/*/index.cjs"
      }
    },
    // Design tokens (SCSS): @use '@org/ui-library/tokens' as tokens;
    "./tokens": {
      "sass": "./src/design-tokens/index.scss"
    },
    // CSS custom properties (for apps that don't use SCSS)
    "./styles": {
      "import": "./dist/styles/index.css",
      "require": "./dist/styles/index.css"
    }
  },

  // Fallback for older bundlers that don't support "exports".
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",

  // CRITICAL: "sideEffects" tells bundlers which files are safe to tree-shake.
  // false = all files are side-effect-free (can be removed if unused).
  // Exception: CSS files ARE side effects (they modify the DOM when imported).
  // Without this, bundlers might remove CSS imports during tree-shaking.
  "sideEffects": [
    "**/*.css",
    "**/*.scss"
  ],

  // "files" defines which files are included in the npm package.
  // Everything not listed here is excluded (like .gitignore for npm).
  // This keeps the package small and prevents shipping source code, tests, stories.
  "files": [
    "dist",
    "src/design-tokens",
    "src/styles",
    "README.md",
    "CHANGELOG.md",
    "LICENSE"
  ],

  // Peer dependencies: the consumer MUST provide these.
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },

  // Regular dependencies: auto-installed when consumer installs our package.
  // ONLY include runtime dependencies that are NOT peer deps.
  "dependencies": {
    "primereact": "^10.9.0",
    "primeicons": "^7.0.0",
    "clsx": "^2.1.0"
  },

  // Dev dependencies: only installed during development, NOT shipped to consumers.
  "devDependencies": {
    "@changesets/cli": "^2.29.0",
    "@commitlint/cli": "^19.8.0",
    "@commitlint/config-conventional": "^19.8.0",
    "@eslint/js": "^9.39.0",
    "@storybook/addon-a11y": "^10.2.0",
    "@storybook/addon-docs": "^10.2.0",
    "@storybook/addon-vitest": "^10.2.0",
    "@storybook/react-vite": "^10.2.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.0",
    "@types/node": "^22.13.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.1.0",
    "@vitest/browser-playwright": "^4.0.0",
    "@vitest/coverage-v8": "^4.0.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.39.0",
    "eslint-config-prettier": "^10.1.0",
    "eslint-plugin-react-hooks": "^7.0.0",
    "eslint-plugin-react-refresh": "^0.4.24",
    "eslint-plugin-storybook": "^10.2.0",
    "globals": "^16.5.0",
    "husky": "^9.1.7",
    "lint-staged": "^15.5.0",
    "playwright": "^1.58.0",
    "postcss": "^8.5.0",
    "postcss-nesting": "^14.0.0",
    "prettier": "^3.5.0",
    "sass": "^1.97.0",
    "storybook": "^10.2.0",
    "stylelint": "^16.23.0",
    "stylelint-config-standard-scss": "^16.0.0",
    "stylelint-scss": "^6.12.0",
    "typescript": "~5.9.0",
    "typescript-eslint": "^8.46.0",
    "vite": "^7.2.0",
    "vite-plugin-dts": "^4.5.0",
    "vite-plugin-lib-inject-css": "^2.2.0",
    "vitest": "^4.0.0"
  },

  // publishConfig: where to publish (overrides default npm registry).
  // This is used by `npm publish` to determine the registry.
  "publishConfig": {
    "@org:registry": "https://npm.pkg.github.com",
    "access": "restricted"
  },

  // engines: minimum Node.js and npm versions.
  // Enforced by npm if the consumer has engine-strict=true.
  "engines": {
    "node": ">=20.19.0",
    "npm": ">=10.0.0"
  },

  // Scripts
  "scripts": {
    "dev": "storybook dev -p 6006 --no-open",
    "build": "tsc -b tsconfig.build.json && vite build",
    "build:storybook": "storybook build",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "lint:styles": "stylelint 'src/**/*.scss'",
    "lint:styles:fix": "stylelint 'src/**/*.scss' --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:storybook": "vitest run --project storybook",
    "test:all": "vitest run --project unit --project storybook",
    "prepublishOnly": "npm run build",
    "prepare": "husky",
    "changeset": "changeset",
    "version:bump": "changeset version",
    "release": "npm run build && changeset publish"
  },

  // Repository metadata
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/ui-library.git"
  },
  "homepage": "https://your-org.github.io/ui-library",
  "bugs": {
    "url": "https://github.com/your-org/ui-library/issues"
  },
  "license": "UNLICENSED",
  "keywords": [
    "react",
    "components",
    "design-system",
    "ui-library",
    "typescript"
  ]
}
```

### Field-by-field explanation

| Field | Purpose | Why it matters |
|---|---|---|
| `name` | Scoped package identity | Maps to registry scope in `.npmrc`. Prevents naming collisions. |
| `version` | SemVer version | Consumers resolve versions via this. Changesets manages it. |
| `type` | `"module"` = ESM by default | Without this, Node.js treats `.js` as CJS. We want ESM. |
| `exports` | Modern entry point map | Defines exactly what can be imported. Supports conditions (`import`/`require`). |
| `main` | CJS entry (legacy fallback) | Older bundlers/Node.js versions that don't understand `exports`. |
| `module` | ESM entry (legacy fallback) | Webpack 4 and older bundlers look for this field. |
| `types` | TypeScript declarations | IDEs and `tsc` use this for type information. |
| `sideEffects` | Tree-shaking hint | `false` = safe to remove. `["**/*.css"]` = CSS must stay. |
| `files` | npm package content | Only ship `dist/`, tokens source (for SCSS consumers), and docs. |
| `peerDependencies` | Consumer-provided deps | Prevents duplicate React. Consumer controls the version. |
| `dependencies` | Auto-installed deps | PrimeReact, clsx — runtime needs that consumers shouldn't worry about. |
| `devDependencies` | Build/dev-only deps | Not installed in consumer's project. Keeps their `node_modules` lean. |
| `publishConfig` | Registry target | Ensures `npm publish` goes to the private registry, not public npm. |
| `engines` | Runtime requirements | Prevents installation on unsupported Node.js versions. |
| `lint-staged` | Pre-commit file targeting | Runs linters only on staged files for fast feedback. |

---

## 11. CI/CD End-to-End Implementation

### 11.1 Development workflow

```
Developer creates feature branch from main
  → Writes component code, stories, tests
    → Runs `npx changeset` to declare version intent
      → Commits with conventional message
        → Husky runs lint-staged (ESLint, Prettier, Stylelint)
          → Pushes to GitHub
            → CI runs: lint, typecheck, test, build
              → PR review
                → Merge to main
                  → Changesets Action creates "Version Packages" PR
                    → Merge "Version Packages" PR
                      → CI publishes to private registry
                        → Consumers run npm update
```

### 11.2 Pull request checks

Every PR triggers these CI checks (in parallel where possible):

1. **Lint** (`npm run lint`) — ESLint + TypeScript checks.
2. **Style lint** (`npm run lint:styles`) — Stylelint SCSS checks.
3. **Format check** (`npm run format:check`) — Prettier compliance.
4. **Type check** (`npm run typecheck`) — TypeScript `--noEmit`.
5. **Unit tests** (`npm run test`) — Vitest.
6. **Storybook build** (`npm run build:storybook`) — Ensures docs compile.
7. **Library build** (`npm run build`) — Ensures production build succeeds.

### 11.3 Version bump strategy with Changesets

#### Initial setup

```bash
# Install changesets CLI
npm install -D @changesets/cli

# Initialize (creates .changeset/ directory with config.json)
npx changeset init
```

#### `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/changelog-github",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

#### Developer workflow

```bash
# After making changes, declare version intent:
npx changeset

# Interactive prompt:
# ? What kind of change is this? (patch/minor/major)
# ? Describe the change:
# Creates: .changeset/fuzzy-lions-dance.md

# The created file looks like:
# ---
# "@org/ui-library": minor
# ---
# Add loading state to Button component
```

#### Automated version bumping (CI)

When the "Version Packages" PR is merged, the CI pipeline runs:

```bash
npx changeset version   # Bumps package.json, updates CHANGELOG.md
npm run build            # Rebuilds with new version
npm publish              # Publishes to registry
```

### 11.4 GitHub Actions CI/CD

#### `.github/workflows/ci.yml` (PR checks)

```yaml
name: CI

on:
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.head_ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22]
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Stylelint
        run: npm run lint:styles
      
      - name: Format check
        run: npm run format:check
      
      - name: Type check
        run: npm run typecheck
  
  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: quality
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
  
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: quality
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build library
        run: npm run build
      
      - name: Build Storybook
        run: npm run build:storybook
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

#### `.github/workflows/release.yml` (Automated release)

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false

permissions:
  contents: write
  packages: write
  pull-requests: write

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@your-org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Create Release PR or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          title: 'chore: version packages'
          commit: 'chore: version packages'
          publish: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Tag release
        if: steps.changesets.outputs.published == 'true'
        run: |
          VERSION=$(node -p "require('./package.json').version")
          git tag "v${VERSION}"
          git push origin "v${VERSION}"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 11.5 Azure Pipelines CI/CD

#### `azure-pipelines.yml` (PR validation)

```yaml
trigger:
  branches:
    include:
      - main

pr:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '22.x'

stages:
  - stage: Validate
    displayName: 'PR Validation'
    jobs:
      - job: Quality
        displayName: 'Quality Checks'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
            displayName: 'Setup Node.js'
          
          - task: npmAuthenticate@0
            inputs:
              workingFile: .npmrc
            displayName: 'Authenticate npm'
          
          - script: npm ci
            displayName: 'Install dependencies'
          
          - script: npm run lint
            displayName: 'ESLint'
          
          - script: npm run lint:styles
            displayName: 'Stylelint'
          
          - script: npm run format:check
            displayName: 'Prettier check'
          
          - script: npm run typecheck
            displayName: 'TypeScript check'
      
      - job: Test
        displayName: 'Tests'
        dependsOn: Quality
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
          
          - task: npmAuthenticate@0
            inputs:
              workingFile: .npmrc
          
          - script: npm ci
            displayName: 'Install dependencies'
          
          - script: npm run test:coverage
            displayName: 'Run tests with coverage'
          
          - task: PublishCodeCoverageResults@2
            inputs:
              summaryFileLocation: coverage/cobertura-coverage.xml
            displayName: 'Publish coverage'
      
      - job: Build
        displayName: 'Build'
        dependsOn: Quality
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
          
          - task: npmAuthenticate@0
            inputs:
              workingFile: .npmrc
          
          - script: npm ci
            displayName: 'Install dependencies'
          
          - script: npm run build
            displayName: 'Build library'
          
          - script: npm run build:storybook
            displayName: 'Build Storybook'
          
          - task: PublishBuildArtifacts@1
            inputs:
              pathtoPublish: dist
              artifactName: library-dist
            displayName: 'Publish build artifacts'

  - stage: Publish
    displayName: 'Publish Package'
    dependsOn: Validate
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - job: PublishNpm
        displayName: 'Publish to Azure Artifacts'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
          
          - task: npmAuthenticate@0
            inputs:
              workingFile: .npmrc
          
          - script: npm ci
            displayName: 'Install dependencies'
          
          - script: npm run build
            displayName: 'Build'
          
          - script: |
              npx changeset version
              npm run build
              npm publish
            displayName: 'Version and publish'
            env:
              AZURE_ARTIFACTS_TOKEN: $(System.AccessToken)
```

### 11.6 Consumer app setup

#### Step 1: Configure `.npmrc` in the consumer app

**For GitHub Packages:**
```ini
@your-org:registry=https://npm.pkg.github.com
```

**For Azure Artifacts:**
```ini
@your-org:registry=https://pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/registry/
always-auth=true
```

#### Step 2: Authenticate

**GitHub (developer machine):**
```bash
npm login --scope=@your-org --registry=https://npm.pkg.github.com
# Username: your-github-username
# Password: ghp_YOUR_PERSONAL_ACCESS_TOKEN
# Email: your@email.com
```

**Azure (developer machine — Windows):**
```bash
npx vsts-npm-auth -config .npmrc
```

**Azure (developer machine — macOS/Linux):**
Add to `~/.npmrc`:
```ini
//pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/registry/:username=anything
//pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/registry/:_password=BASE64_PAT
//pkgs.dev.azure.com/YOUR_ORG/YOUR_PROJECT/_packaging/YOUR_FEED/npm/registry/:email=you@company.com
```

#### Step 3: Install the library

```bash
npm install @your-org/ui-library
```

#### Step 4: Use in the app

```tsx
import { Button, DataTable } from '@your-org/ui-library';

function App() {
  return (
    <div className="ui-theme-light">
      <Button variant="primary" onClick={() => alert('Hello!')}>
        Click Me
      </Button>
    </div>
  );
}
```

CSS is auto-imported — no manual stylesheet include needed (thanks to `vite-plugin-lib-inject-css`).

#### Step 5: (Optional) Import design tokens in consumer's SCSS

```scss
// Consumer's SCSS file
@use '@your-org/ui-library/tokens' as tokens;

.my-custom-header {
  color: tokens.$color-primary;
  font-family: tokens.$font-family-sans;
  padding: tokens.$spacing-4;
}
```

This works because we included `src/design-tokens` in the `files` field and defined the `./tokens` export in `exports`.

### 11.7 Rollback strategy

If a bad version is published:

1. **npm unpublish** (within 72 hours):
   ```bash
   npm unpublish @your-org/ui-library@1.2.3
   ```
   Note: npm's unpublish policy allows this only within 72 hours and if no other packages depend on that exact version.

2. **Publish a patch fix**:
   ```bash
   # Fix the bug, create a changeset:
   npx changeset  # Select "patch"
   # Merge and let CI publish 1.2.4
   ```

3. **`npm deprecate`** (for versions that should not be used but aren't broken enough to unpublish):
   ```bash
   npm deprecate @your-org/ui-library@1.2.3 "Known issue with Button, use 1.2.4+"
   ```

4. **Consumers pin versions**:
   Encourage consumers to use exact versions or narrow ranges:
   ```json
   "@your-org/ui-library": "~1.2.4"
   ```

---

## 12. Tradeoffs & Enterprise Scalability Analysis

### 12.1 Major decision tradeoffs

#### Decision: Vite library mode over standalone Rollup

| What we gain | What we lose |
|---|---|
| Unified dev + build toolchain | Some Rollup plugins may not work through Vite's abstraction |
| Faster DX (HMR, Storybook) | Slight learning curve if team knows only Webpack |
| Smaller config surface | Less control over Rollup internals (rare edge cases) |

**Scaling limitation:** Vite 7 still uses JavaScript-based Rollup for production builds. For libraries with 500+ components, build times may reach 2-5 minutes. Vite 8 (Rolldown, Rust-based) will address this.

**Enterprise risk:** Low. Vite is backed by the Vue/Vite team, has massive ecosystem adoption, and is the recommended build tool for new React projects.

#### Decision: External CSS over CSS-in-JS

| What we gain | What we lose |
|---|---|
| Zero runtime CSS overhead | Cannot do dynamic styles based on JS state (use CSS custom properties instead) |
| Smaller JS bundles | Consumer must handle CSS imports (all modern bundlers do) |
| Better caching (separate CSS cache) | BEM naming discipline required |
| SSR-safe | Slightly more complex build pipeline |

**Scaling limitation:** As component count grows, ensuring BEM naming uniqueness becomes harder. Mitigation: the `ui-` prefix and component-scoped `.scss` files.

**Enterprise risk:** Low. This is the industry standard approach for design systems (IBM Carbon, Ant Design, etc.).

#### Decision: preserveModules over single bundle

| What we gain | What we lose |
|---|---|
| Best tree-shaking | More files in npm package (hundreds) |
| Per-component CSS isolation | Slightly more complex Rollup config |
| Clear source-to-output mapping | Exposes internal file structure |

**Scaling limitation:** npm packages with 1000+ files can have slower install times. Mitigation: use `files` in package.json to ship only necessary files.

**Enterprise risk:** Very low. This is how Material UI, Chakra UI, and most large libraries ship.

#### Decision: GitHub Packages over Azure Artifacts (or vice versa)

| Criteria | GitHub Packages wins | Azure Artifacts wins |
|---|---|---|
| CI simplicity | `GITHUB_TOKEN` is auto-available | Requires PAT or service connection |
| Upstream proxy | Not available | Available (caches public npm) |
| AD integration | GitHub Enterprise SAML | Native Azure AD |
| Cost | Free for public, included in plan | 2GB free, then metered |
| Multi-feed | Per-org only | Per-project, per-feed |

**Enterprise risk:** Both are enterprise-grade. Choose based on your org's primary platform.

#### Decision: Single package over monorepo

| What we gain | What we lose |
|---|---|
| Simple setup and CI | Ability to install subsets of components |
| Single version to track | PrimeReact forced on all consumers |
| Easier contributor onboarding | Eventually, build times grow |

**Scaling limitation:** At ~50+ components, consider splitting into `@org/ui-core` and `@org/ui-data` (PrimeReact-based). At ~100+ components with multiple teams, migrate to Turborepo/pnpm workspaces.

**Enterprise risk:** Low to start. Medium if you don't plan the migration path early.

#### Decision: Changesets over manual versioning

| What we gain | What we lose |
|---|---|
| Automated CHANGELOG | Extra step per PR (`npx changeset`) |
| Aggregated version bumps | Learning curve for contributors |
| Consistent SemVer | Dependency on Changesets tooling |
| CI-driven publishing | "Version Packages" PR step |

**Scaling limitation:** In monorepos with 10+ packages, Changesets can create very large "Version Packages" PRs. Mitigation: use `fixed` or `linked` groups.

**Enterprise risk:** Very low. Changesets is used by Atlassian, Shopify, and most major open-source projects.

### 12.2 Enterprise scalability matrix

| Component Count | Build Time | CI Time | Recommended Structure |
|---|---|---|---|
| 1–20 | < 30s | < 3 min | Single package, simple CI |
| 20–50 | 30s–2 min | 3–5 min | Single package, parallel CI jobs |
| 50–100 | 2–5 min | 5–10 min | Consider splitting into 2–3 packages |
| 100–200 | 5–10 min | 10–20 min | Monorepo with Turborepo |
| 200+ | 10+ min | 20+ min | Monorepo + affected-only builds + Nx or Turborepo |

---

## 13. Step-by-Step Implementation Roadmap

### Phase 0: Project scaffolding (Day 1)

```bash
# Create project directory
mkdir ui-library && cd ui-library

# Initialize package.json
npm init -y

# Initialize git
git init

# Create directory structure
mkdir -p src/{components,design-tokens,hooks,utils,styles}
mkdir -p .storybook
mkdir -p .changeset
mkdir -p .github/workflows
```

### Phase 1: Core tooling setup (Days 1–2)

#### Step 1: Install core dependencies

```bash
# React (peer deps — install as dev deps for local development)
npm install -D react react-dom @types/react @types/react-dom

# Vite + React plugin
npm install -D vite @vitejs/plugin-react

# TypeScript
npm install -D typescript

# Vite plugins for library mode
npm install -D vite-plugin-dts vite-plugin-lib-inject-css

# SCSS
npm install -D sass

# PostCSS
npm install -D postcss autoprefixer postcss-nesting
```

#### Step 2: Create TypeScript config

Create `tsconfig.json` and `tsconfig.build.json` as shown in Section 5.

#### Step 3: Create Vite config

Create `vite.config.ts` as shown in Section 5.

#### Step 4: Create PostCSS config

Create `postcss.config.mjs` as shown in Section 6.5.

#### Step 5: Create Browserslist config

Create `.browserslistrc` as shown in Section 6.6.

### Phase 2: Design tokens and styles (Days 2–3)

#### Step 6: Create design token files

Create all files in `src/design-tokens/` as shown in Section 9.

#### Step 7: Create global styles and mixins

Create files in `src/styles/` as shown in Section 9.

#### Step 8: Create root barrel export

```ts
// src/index.ts
export { Button } from './components/Button';
// Add more component exports as they are created
```

### Phase 3: First component (Day 3)

#### Step 9: Create Button component

```tsx
// src/components/Button/Button.tsx
import { type FC, type ButtonHTMLAttributes } from 'react';
import type { ButtonProps } from './button.types';
import { getButtonClasses } from './button.utils';
import { BUTTON_DEFAULTS } from './button.constants';
import './button.scss';

export const Button: FC<ButtonProps> = ({
  variant = BUTTON_DEFAULTS.variant,
  size = BUTTON_DEFAULTS.size,
  loading = false,
  disabled = false,
  children,
  className,
  ...rest
}) => {
  const classes = getButtonClasses({ variant, size, loading, className });

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="ui-btn__spinner" aria-hidden="true" />}
      <span className={loading ? 'ui-btn__content--hidden' : 'ui-btn__content'}>
        {children}
      </span>
    </button>
  );
};
```

```ts
// src/components/Button/button.types.ts
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}
```

```ts
// src/components/Button/button.utils.ts
import type { ButtonVariant, ButtonSize } from './button.types';

interface ButtonClassParams {
  variant: ButtonVariant;
  size: ButtonSize;
  loading: boolean;
  className?: string;
}

export function getButtonClasses({
  variant,
  size,
  loading,
  className,
}: ButtonClassParams): string {
  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    loading && 'ui-btn--loading',
    className,
  ].filter(Boolean);

  return classes.join(' ');
}
```

```ts
// src/components/Button/button.constants.ts
import type { ButtonVariant, ButtonSize } from './button.types';

export const BUTTON_DEFAULTS = {
  variant: 'primary' as ButtonVariant,
  size: 'md' as ButtonSize,
} as const;
```

```ts
// src/components/Button/index.ts
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './button.types';
```

Create `button.scss` as shown in Section 9.4.

### Phase 4: Quality tooling (Days 3–4)

#### Step 10: Install and configure ESLint

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks \
  eslint-plugin-react-refresh eslint-config-prettier globals
```

Create `eslint.config.mts` as shown in Section 6.1.

#### Step 11: Install and configure Prettier

```bash
npm install -D prettier
```

Create `.prettierrc.json` and `.prettierignore` as shown in Section 6.2.

#### Step 12: Install and configure Stylelint

```bash
npm install -D stylelint stylelint-config-standard-scss stylelint-scss
```

Create `stylelint.config.mjs` as shown in Section 6.4.

#### Step 13: Install and configure Husky + lint-staged + commitlint

```bash
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# Initialize Husky
npx husky init
```

Create `.husky/pre-commit`, `.husky/commit-msg`, and `commitlint.config.mjs` as shown in Section 6.3.

Add `lint-staged` config to `package.json` as shown in Section 6.3.

### Phase 5: Storybook (Days 4–5)

#### Step 14: Install and configure Storybook 10

```bash
# Storybook auto-detection will set up React + Vite builder
npx storybook@latest init

# Install additional addons
npm install -D @storybook/addon-a11y
```

Replace `.storybook/main.ts` and `.storybook/preview.ts` with configurations from Section 7.

#### Step 15: Create first story

Create `Button.stories.tsx` as shown in Section 7.5.

#### Step 16: Verify Storybook runs

```bash
npm run dev  # Starts Storybook on localhost:6006
```

### Phase 6: Testing (Days 5–6)

#### Step 17: Install testing dependencies

```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event jsdom
```

#### Step 18: Configure Vitest

Create `vitest.config.ts` as shown in Section 8.2.

Create `src/test-setup.ts` as shown in Section 8.3.

#### Step 19: Write first test

Create `Button.test.tsx` as shown in Section 8.4.

#### Step 20: Install Storybook test addon

```bash
npx storybook add @storybook/addon-vitest
```

### Phase 7: Build verification (Day 6)

#### Step 21: Test the build

```bash
npm run build
```

Verify `dist/` contains:
- `index.mjs` (ESM entry)
- `index.cjs` (CJS entry)
- `index.d.mts` (TypeScript declarations)
- `components/Button/Button.mjs` (per-component ESM)
- `components/Button/button.css` (per-component CSS)
- CSS imports at the top of each `.mjs` file

#### Step 22: Test locally with `npm link`

```bash
# In ui-library:
npm link

# In a consumer app:
npm link @your-org/ui-library

# Import and use:
import { Button } from '@your-org/ui-library';
```

### Phase 8: Private hosting + CI/CD (Days 6–7)

#### Step 23: Set up Changesets

```bash
npm install -D @changesets/cli @changesets/changelog-github
npx changeset init
```

Configure `.changeset/config.json` as shown in Section 11.3.

#### Step 24: Configure private registry

Create `.npmrc` and `publishConfig` in `package.json` as shown in Section 4.

#### Step 25: Set up CI/CD

Create GitHub Actions workflows (`.github/workflows/ci.yml` and `.github/workflows/release.yml`) as shown in Section 11.4.

OR create Azure Pipelines config (`azure-pipelines.yml`) as shown in Section 11.5.

#### Step 26: First publish

```bash
# Manual first publish to verify setup:
npm run build
npm publish

# Subsequent publishes are automated via Changesets + CI
```

### Phase 9: Ongoing development (Week 2+)

- Add more components following the Button pattern.
- Build Storybook docs site and deploy (GitHub Pages or Azure Static Web Apps).
- Set up visual regression testing (Chromatic).
- Create CODEOWNERS file for component-level ownership.
- Document contribution guidelines.

---

## 14. Extra Considerations for Library Development

### 14.1 Accessibility (a11y) from day one

Every component must be accessible. This is not optional for enterprise libraries.

**Requirements:**
- **Keyboard navigation**: Every interactive element must be reachable and operable via keyboard.
- **ARIA attributes**: Correct `role`, `aria-label`, `aria-expanded`, etc.
- **Focus management**: Modals trap focus, dropdowns return focus on close.
- **Color contrast**: All text meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text).
- **Screen reader support**: Test with NVDA, VoiceOver, JAWS.

**Tooling:**
- Storybook `@storybook/addon-a11y` scans every story with axe-core.
- ESLint `eslint-plugin-jsx-a11y` catches common a11y violations in code.
- Manual testing with screen readers before each release.

### 14.2 Internationalization (i18n) readiness

Even if you don't need i18n today, designing for it prevents costly refactors later.

**Guidelines:**
- Never hardcode user-facing strings. Accept them as props.
- Support `dir="rtl"` layouts (use logical CSS properties: `margin-inline-start` instead of `margin-left`).
- Use `Intl` APIs for date/number formatting in examples.
- Accept `locale` prop in date pickers, number inputs, etc.

### 14.3 Performance budgets

Set bundle size limits and enforce them in CI.

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/index.mjs",
      "maxSize": "50 kB"
    },
    {
      "path": "./dist/components/Button/Button.mjs",
      "maxSize": "2 kB"
    }
  ]
}
```

Use `bundlesize` or `size-limit` package to enforce in CI.

### 14.4 Changelog and release notes

Changesets auto-generates `CHANGELOG.md`. Configure it to link to GitHub PRs and author names:

```bash
npm install -D @changesets/changelog-github
```

In `.changeset/config.json`:
```json
{
  "changelog": ["@changesets/changelog-github", { "repo": "your-org/ui-library" }]
}
```

This produces changelogs like:

```markdown
## 1.2.0

### Minor Changes

- feat(button): add loading state variant (#42) — @developer-name
- feat(input): add prefix/suffix slot support (#45) — @other-developer

### Patch Changes

- fix(modal): prevent body scroll when open (#47) — @developer-name
```

### 14.5 Documentation beyond Storybook

Storybook is the primary documentation tool, but consider:

- **README.md**: Quick start guide, installation, basic usage.
- **CONTRIBUTING.md**: How to set up dev environment, coding standards, PR process.
- **MIGRATION.md**: Upgrade guides between major versions.
- **ADR (Architecture Decision Records)**: Document major decisions (CSS strategy, bundling approach, etc.) so future contributors understand WHY, not just WHAT.

### 14.6 Security considerations

- **Dependency scanning**: Use `npm audit`, Dependabot, or Snyk in CI.
- **No secrets in source**: `.npmrc` in repo should never contain tokens. Use CI environment variables.
- **Package provenance**: Consider npm provenance (npm v9.5+) to cryptographically prove packages were built in CI.
- **Lock files**: Commit `package-lock.json` to ensure reproducible installs.
- **License compliance**: Use `license-checker` to ensure all dependencies are compatible with your license.

### 14.7 Consumer developer experience (DX)

**What makes a great library DX:**

1. **TypeScript autocomplete**: Props, variants, and sizes should autocomplete in the IDE.
2. **Error messages**: Use `console.warn` in development mode for common mistakes (e.g., "Button requires children").
3. **Storybook examples**: Every prop combination should have a story.
4. **Migration codemods**: When breaking changes are necessary, provide `jscodeshift` codemods.
5. **GitHub Discussions**: A place for consumers to ask questions without clogging Issues.
6. **Canary releases**: Publish pre-release versions (`1.2.0-canary.1`) for early testing.

### 14.8 Design token synchronization with Figma

If your design team uses Figma, consider:

- **Figma Tokens plugin**: Exports tokens from Figma as JSON.
- **Style Dictionary**: Transforms JSON tokens into SCSS variables, CSS custom properties, iOS/Android values.
- **Automated sync**: CI pipeline that pulls tokens from Figma API and generates SCSS files.

This ensures tokens in code always match tokens in Figma, eliminating design-to-code drift.

### 14.9 Error boundaries and fallback UI

Provide a library-level `ErrorBoundary` component that consumers can wrap around library components:

```tsx
import { ErrorBoundary } from '@your-org/ui-library';

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <DataTable columns={columns} data={data} />
</ErrorBoundary>
```

### 14.10 Compound component patterns

For complex components (Select, Tabs, Accordion), use compound component patterns:

```tsx
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
</Tabs>
```

This gives consumers maximum flexibility while maintaining internal state management.

### 14.11 Forwarding refs (React 19+)

React 19 allows `ref` as a regular prop, eliminating the need for `forwardRef`:

```tsx
// React 19 — ref is just a prop
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  ref?: React.Ref<HTMLButtonElement>;
}

export const Button: FC<ButtonProps> = ({ ref, variant, children, ...rest }) => {
  return <button ref={ref} {...rest}>{children}</button>;
};
```

### 14.12 Monitoring library usage

Track which components are used most/least:

- **npm download stats**: Basic usage data.
- **Bundle analyzer**: Consumers can run Webpack/Vite bundle analyzer to see which components they actually import.
- **Telemetry (opt-in)**: For very large orgs, anonymous usage telemetry can inform which components to invest in.

### 14.13 Deprecation strategy

When deprecating a component or prop:

1. Add `@deprecated` JSDoc tag (shows strikethrough in IDE).
2. Add `console.warn` in development mode.
3. Document in MIGRATION.md.
4. Keep deprecated code for at least 2 minor versions before removing in the next major.

```tsx
/**
 * @deprecated Use `variant="outline"` instead. Will be removed in v3.0.
 */
export interface OldButtonProps {
  outlined?: boolean;
}
```

### 14.14 Bundle analysis

Add a script to visualize what's in the build output:

```json
{
  "scripts": {
    "analyze": "vite build --mode analyze"
  }
}
```

Use `rollup-plugin-visualizer` to generate a treemap of the bundle:

```ts
// Add to vite.config.ts plugins (only in analyze mode)
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  // ... other plugins
  process.env.ANALYZE && visualizer({
    open: true,
    filename: 'bundle-analysis.html',
  }),
],
```

---

## Summary

This blueprint provides everything needed to build, document, test, and ship a production-grade React component library. The key architectural decisions are:

1. **Vite 7 library mode** with Rollup under the hood for the best DX-to-production pipeline.
2. **External SCSS → CSS** with per-component injection for zero-runtime styling.
3. **preserveModules** for maximum tree-shaking granularity.
4. **ESM + CJS dual format** for broad compatibility.
5. **Storybook 10** for living documentation and interaction testing.
6. **Vitest 4** for fast, Vite-native unit testing.
7. **Changesets** for automated, changelog-driven versioning.
8. **GitHub Packages or Azure Artifacts** for private hosting with full npm compatibility.
9. **Husky + lint-staged + commitlint** for local quality gates.
10. **CSS custom properties** for runtime theming (light/dark mode).

Every decision is reversible. Start simple, measure, and add complexity only when the data demands it.
