You are a Senior Frontend Architect, Build Systems Expert, and Design System Specialist with 12+ years of experience building scalable enterprise UI libraries.
I want you to create a deep research-level architectural blueprint for building a React Component Library (Design System) using the following stack latest version:
React (latest stable)
Vite (latest stable)
Storybook (version 10+ latest syntax)
SCSS
TypeScript
Vitest (compare inside Storybook vs separate)
ESLint (latest flat config if applicable)
Prettier
Husky (latest version)
Stylelint
PostCSS
Browserslist
Rollup options inside Vite
Azure DevOps
GitHub
Private npm package hosting

 Objective
We need to:
Build a scalable, enterprise-grade React Design System UI Library
Use Vite as build tool
Use Storybook 10+ for documentation
Host the package privately
Publish as private npm package
Install via npm in internal apps
Use Azure + GitHub for CI/CD and package hosting

 Required Folder Structure
All configurations must align with this exact structure:
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
 ├─ .eslintrc (or flat config)
 ├─ .prettierrc
 ├─ .stylelintrc
 ├─ postcss.config.js
 ├─ .browserslistrc
 └─ ...

Some complex components wrap PrimeReact internally but expose only our design-system API.
We have global design tokens that must apply across all components.

🔬 What I Want From You
1️ Architecture-Level Deep Research
Act like you are presenting to a CTO and developer.
Explain:
Why Vite over Rollup standalone?
Why library mode?
Why not CRA?
Why not Next?
Tradeoffs of bundling CSS inside JS vs external CSS
Tree shaking strategy
Peer dependencies strategy
Bundle format (ESM, CJS, UMD — which and why)
Scoped package vs internal registry
Monorepo vs single package
Scalability concerns
Versioning strategy (SemVer + Changesets?)
Performance implications
Argue with yourself. Compare options.

2️ Private Hosting Options (Deep Comparison Required)
Explain ALL possible ways to host privately:
GitHub Options:
GitHub Packages
GitHub npm registry
GitHub Releases tarball
GitHub as dependency (git+ssh)
GitHub Actions publishing
Azure Options:
Azure Artifacts (npm feed)
Azure DevOps pipeline publish
Azure + GitHub hybrid approach
Compare:
Security
Access control
Cost
CI integration
Developer experience
Provide:
.npmrc examples
publishConfig examples
auth token setup
CI YAML examples

3️ Vite Build Configuration (Deep Dive)
You must:
Use latest Vite syntax
Use library mode
Explain every option in build config
Show rollupOptions in detail
external configuration
preserveModules vs single bundle
CSS code splitting
Inject SCSS properly
Isolated CSS per component
Global design tokens injection
d.ts generation
Excluding stories, tests from build
Including only production files
Provide full vite.config.ts with comments.

4️ Tooling Configuration (Latest Versions Only)
For each tool:
Explain WHY we use it
What problem it solves
Why not alternatives
How it integrates with Vite
Performance impact
Enterprise benefits
How use it
Then provide FULL working config:
ESLint
Flat config if latest supports
TypeScript support
React hooks rules
Import order
Ignore stories in production
Prettier
Full config
Integration with ESLint
Husky
pre-commit
lint-staged
commit message lint?
Stylelint
SCSS support
Design token enforcement
PostCSS
autoprefixer
nesting
modern CSS features
Browserslist
enterprise supported browsers

5️ Storybook 10+ Configuration
Must:
Use latest syntax
Vite builder
Docs mode
Controls
Global decorators
Design token theme provider
Story structure aligned with folder
MDX support
Addon configuration
Compare:
Storybook testing vs Vitest
When to use both
Pros and cons
Provide .storybook/main.ts and preview.ts.

6️ Testing Strategy
Compare:
Vitest standalone
Storybook test runner
Playwright
Component testing vs unit testing
Provide:
vitest.config.ts
Setup file
Coverage config

7️ SCSS Architecture
Explain:
Global tokens
SCSS variables
CSS Modules vs global SCSS
Utility classes
Theming strategy
Dark mode strategy
PrimeReact wrapping strategy
Provide real working examples.

8️ Package.json Best Practices
Must include:
exports field
types
sideEffects
files include/exclude
peerDependencies
publishConfig
engines
Explain each field.

9️ CI/CD End-to-End Plan for publishing package with versioning and documentation for release change 
Step-by-step:
Dev workflow
Pull request checks
Version bump strategy
Automated publishing
Tagging
Internal consumption
Rollback strategy
Provide:
GitHub Actions example
Azure Pipeline example
Private Hosting Strategy (Azure vs. GitHub)
Compare GitHub Packages (NPM Registry) vs. Azure Artifacts.
Provide an end-to-end guide on how to:
Authenticate locally using .npmrc.
Configure a CI/CD pipeline (GitHub Actions or Azure Pipelines) to auto-publish versions.
Allow a consumer app to run npm install @scope/my-lib.


Tradeoff Analysis
For each major decision:
What we gain
What we lose
Scaling limitations
Enterprise risk

Output Format Required
Structure the answer as:
Executive Architecture Overview
Folder Structure Justification
Each Tooling Deep Dive with actual code
Vite Build Internals
Storybook Architecture
Testing Architecture
Private Hosting Strategy Comparison Table
CI/CD Implementation
Tradeoffs & Enterprise Scalability Analysis
Step-by-Step Implementation plan Roadmap with code
Any thing extra apart from this consider for library development with explanation
Answer should be in format for any person who is new to build designsystem ui library have all explanation in this document
Use code blocks for real configs.
Strictly flow latest stable versions as of 2026.
Be extremely detailed.
Do not give surface-level answers.
Think like a build system architect designing a reusable enterprise platform.
Argue with yourself when comparing approaches in answer.
Be exhaustive.