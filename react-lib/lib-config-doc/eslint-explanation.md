Structural Mechanics of ESLint and Architectural Design of Scalable Flat Configurations for Modern React Component Libraries
The implementation of static analysis within a modern software development lifecycle has transitioned from a peripheral concern to a central pillar of architectural integrity. Within the JavaScript and TypeScript ecosystem, ESLint serves as the primary instrument for enforcing code quality, stylistic consistency, and programmatic correctness. As of 2026, the tool has undergone a foundational metamorphosis, moving away from legacy hierarchical configuration models toward a standardized, high-performance "Flat Config" system. For a React UI component library—a critical piece of infrastructure that serves as the visual and functional foundation for numerous downstream applications—the linting strategy must be exhaustive, covering everything from basic syntax to complex type-aware architectural constraints, accessibility compliance, and compatibility with the latest React Compiler optimizations. Understanding the internal mechanics of ESLint is the prerequisite for designing a configuration that is both scalable and performant across large-scale monorepos and distributed component ecosystems.
The Engineering Behind ESLint: From Source Code to AST Traversal
ESLint does not operate on source code as a monolithic block of text; instead, it utilizes a sophisticated pipeline that transforms raw strings into a queryable data structure. This process is the foundation upon which all rules, plugins, and custom logic are built. The journey from a .tsx file on disk to a linting error in an IDE involves several distinct phases of computational linguistics and static analysis.
Tokenization and Lexical Analysis
The first phase of the ESLint execution cycle is tokenization, also referred to as lexical analysis. During this stage, the linter takes a stream of characters as input and breaks them down into atomic units called tokens. These tokens represent the smallest syntactic units of the language, such as keywords (const, function), identifiers (myComponent), operators (=, +), and literals ("hello", 42). Tokenization is a linear process that discards irrelevant information, such as whitespace and comments (though comments are often preserved in a separate data structure for specific rules), to create a simplified representation of the code’s intent.
Parsing and the Abstract Syntax Tree (AST)
Once the code has been tokenized, it must be arranged into a hierarchical structure that reflects its grammatical relationships. This is achieved through parsing, which constructs an Abstract Syntax Tree (AST). The AST is a tree-based model where each node represents a specific instance of syntax from the source code. ESLint adheres to the ESTree specification, a community standard for representing JavaScript syntax in a tree format.
For a standard JavaScript project, ESLint uses the Espree parser. However, when dealing with non-standard syntax—such as the JSX and TypeScript required for a React component library—custom parsers must be utilized. The @typescript-eslint/parser is specifically designed to handle TypeScript’s unique constructs, such as interfaces and type annotations, while preserving the standard ESTree structure for common JavaScript elements. This interoperability allows core ESLint rules to run alongside TypeScript-specific rules without conflict.

Parser Component
Responsibility
Relevant Source
Lexer
Converts raw source text into a stream of tokens.
1
Parser
Transforms tokens into a hierarchical AST.
1
ESTree
The standardized specification for AST nodes.
1
Espree
The default JavaScript parser for ESLint.
2
TypeScript-ESTree
Converts TS syntax into a compatible AST for ESLint.
2

The Visitor Pattern and Traversal Engine
The core logic of ESLint resides in its traversal engine, which implements the "visitor pattern." As ESLint walks the AST, it notifies interested rules whenever it "enters" or "exits" a specific node type. A rule can subscribe to any node type, such as VariableDeclaration, FunctionExpression, or JSXOpeningElement. When the engine encounters a subscribed node, it executes a callback function defined within the rule.
This design enables a single-pass analysis of the entire codebase. Rather than each rule walking the tree independently—which would be computationally expensive—ESLint walks the tree once and allows hundreds of rules to listen to the events it triggers. This efficiency is critical for component libraries where a single component might trigger rules from core ESLint, the React plugin, the TypeScript plugin, and accessibility plugins simultaneously.
The Anatomy of an ESLint Rule
A rule is a modular unit of analysis that exports a meta object and a create function. The meta object provides descriptive data used by ESLint and IDE extensions, such as the rule’s category (problem, suggestion, or layout), its fixability, and the JSON Schema for any configuration options it accepts. The create function returns an object containing the visitor functions. These functions receive the current node and a context object, which provides utilities for inspecting the AST and reporting violations.

Rule Property
Description
Contextual Significance
meta.type
Indicates if the rule addresses a bug, a suggestion, or formatting.
5
meta.docs
Provides a description and URL for documentation.
5
meta.fixable
Denotes if the rule can automatically correct the code.
5
meta.schema
Defines the configuration options the rule supports.
5
create(context)
The entry point for the rule's analysis logic.
1

The Transformation to Flat Config: v9 and v10 Paradigms
For over a decade, ESLint relied on a configuration system (.eslintrc) based on file-system hierarchies and implicit cascading. This system, while flexible, often led to unpredictable rule applications and complex debugging scenarios in monorepos. The "Flat Config" system, introduced in v9 and refined in v10, replaces this with an explicit, array-based configuration located in eslint.config.js.
Explicit native Loading
One of the most significant changes in the Flat Config system is the transition from string-based plugin references to native JavaScript imports. In the legacy system, a developer would specify a plugin as a string (e.g., "react"), and ESLint would attempt to resolve it using an internal, often opaque, mechanism. In Flat Config, plugins are imported as standard JavaScript objects. This shift leverages the Node.js native loading mechanism, improving performance and eliminating resolution errors that were common in complex project structures.
The Linear Array of Objects
A Flat Config file exports an array of configuration objects. ESLint processes these objects in order, with later objects overriding previous ones. This linear approach is far simpler to reason about than the previous cascading model. Each object can specify a files pattern, a plugins map, languageOptions, and rules. If an object does not specify a files key, it acts as a global configuration that applies to all files matched by previous objects.
Enhanced Utilities: defineConfig and globalIgnores
Building upon the initial release of Flat Config, the ESLint team introduced the defineConfig helper and the globalIgnores function in late 2024 and early 2025 to address user feedback regarding type safety and the confusion surrounding global vs. local ignore patterns.
The defineConfig utility provides a type-safe wrapper for the configuration array. It automatically flattens nested arrays, meaning that third-party configurations (which are often arrays themselves) can be included without the need for the JavaScript spread operator. Furthermore, it reintroduced a standardized extends keyword inside configuration objects, allowing for a more readable way to apply external rule sets to specific subsets of files. The globalIgnores function makes it explicit which directories should be completely excluded from linting, functioning similarly to a .gitignore file.

Utility Function
Purpose
v10 Improvement
defineConfig()
Provides types and flattens nested config arrays.
7
globalIgnores()
Explicitly excludes directories from the entire linting process.
7
extends (Flat)
Allows scoped application of third-party rule sets.
7

Architectural Constraints for React UI Component Libraries
A UI component library is not a standard application; it is a dependency. This distinction imposes unique requirements on its linting configuration. The code produced must be highly compatible, tree-shakeable, and accessible. It must also be resilient to changes in the React ecosystem, such as the introduction of the React Compiler.
Enforcing Named Exports for Tree-Shaking
In a library context, default exports are generally considered an anti-pattern. When a consumer imports from a library, named exports allow bundlers like Vite, Rollup, and Webpack to perform more effective tree-shaking—removing code that is not explicitly imported. Furthermore, named exports provide a better developer experience by ensuring that components are imported with consistent names across the consumer's codebase.
The linting configuration should enforce the use of named exports for components and utilities while restricting default exports. This is particularly important for Fast Refresh (HMR), as the React Refresh plugin works most reliably when a file only exports React components. If a file exports both a component and a non-component value (common with default exports), a change to the non-component value can trigger a full page reload instead of a surgical hot update.
The React Compiler and Static Purity
As of 2026, the React Compiler (React Forget) has become a standard part of the build pipeline for high-performance libraries. The compiler automatically memoizes components and hooks, but it relies on the code adhering strictly to the "Rules of React." Components must be pure, props and state must be treated as immutable, and side effects must be isolated.
The eslint-plugin-react-compiler provides essential guardrails for this transition. It identifies "de-optimizations" where the compiler is forced to bail out due to rule violations. For a library maintainer, ensuring 100% compiler compatibility is vital to providing the best possible performance to end users.
Accessibility (a11y) as a Core Requirement
A UI library that is not accessible is a liability for its consumers. Therefore, accessibility linting must be integrated at the foundation. The eslint-plugin-jsx-a11y plugin enforces standard WCAG (Web Content Accessibility Guidelines) requirements, such as ensuring images have alt text, form elements have labels, and interactive elements are keyboard-navigable. By catching these issues in the library, the maintainers prevent a cascade of accessibility failures in the applications built upon it.
Best-Practice Scalable Flat Configuration: Implementation
The following configuration is designed for a library using Vite, TypeScript, SCSS, and Storybook. It utilizes the latest defineConfig and globalIgnores patterns to maximize maintainability and performance.

JavaScript


/** @file eslint.config.js */
import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import refreshPlugin from "eslint-plugin-react-refresh";
import storybookPlugin from "eslint-plugin-storybook";
import perfectionist from "eslint-plugin-perfectionist";
import a11yPlugin from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

/** 
 * Scalable Flat Configuration for React UI Libraries
 * Targets: Vite, TypeScript, SCSS, Storybook
 */
export default defineConfig(
  // 1. Global Ignores
  // Replaces.eslintignore. Evaluated relative to the config file location.
  globalIgnores([
    "dist/**", 
    "build/**", 
    "node_modules/**", 
    "coverage/**", 
    "storybook-static/**",
    "**/*.d.ts"
  ], "Global Exclusion Patterns"),

  // 2. Base Configuration for All Files
  {
    name: "Base Environment",
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest", // Defaults to latest ES version
      sourceType: "module", // Defaults to ESM
      globals: {
       ...globals.browser,
       ...globals.es2021,
       ...globals.node, // Necessary for build scripts and config files
      },
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // 3. Specialized TypeScript Configuration
  // Uses tseslint.config to ensure type safety within the config file.
  tseslint.config(
    {
      name: "Strict TypeScript",
      files: ["**/*.{ts,tsx}"],
      // Extends multiple presets. strictTypeChecked is recommended for libraries.
      extends:,
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          // Enables the high-performance Project Service for typed rules.
          projectService: true,
          // Ensures the parser can find the correct tsconfig.json.
          tsconfigRootDir: import.meta.dirname,
        },
      },
      rules: {
        // Disallow the use of 'any' to preserve library type integrity.
        "@typescript-eslint/no-explicit-any": "error",
        // Enforce consistent type imports to aid tree-shaking and avoid circularities.
        "@typescript-eslint/consistent-type-imports":,
        // Allow underscores for unused parameters (e.g., in map functions).
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      },
    }
  ),

  // 4. React and Accessibility Layer
  {
    name: "React Architectural Standards",
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": hooksPlugin,
      "jsx-a11y": a11yPlugin,
    },
    settings: {
      react: { 
        version: "detect" // Automatically identifies React version from node_modules
      },
    },
    rules: {
      // Basic React rules
     ...reactPlugin.configs.recommended.rules,
      // Support for the modern JSX transform (React 17+)
     ...reactPlugin.configs["jsx-runtime"].rules,
      // Rules of Hooks (exhaustive-deps is critical for library stability)
     ...hooksPlugin.configs.recommended.rules,
      // Accessibility best practices
     ...a11yPlugin.configs.recommended.rules,
      
      // Library-specific overrides
      "react/prop-types": "off", // Handled by TypeScript
      "react/display-name": "error", // Mandatory for debugging HOCs and components
      "react/no-unstable-nested-components": "error", // Prevents state loss during re-renders
      "jsx-a11y/anchor-is-valid": "warn",
    },
  },

  // 5. Development-Specific Rules: Fast Refresh
  {
    name: "Vite Fast Refresh Support",
    files: ["src/**/*.{jsx,tsx}"],
    plugins: {
      "react-refresh": refreshPlugin,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { 
          // Vite-specific: allow constant exports alongside components
          allowConstantExport: true 
        },
      ],
    },
  },

  // 6. Storybook Integration (CSF3 and Testing)
  {
    name: "Storybook CSF3 Compliance",
    // Targets Storybook-specific file patterns
    files: ["**/*.stories.{ts,tsx,js,jsx,mjs,cjs}"],
    // Applies Storybook's recommended flat configuration
    extends: [storybookPlugin.configs["flat/recommended"]],
    rules: {
      // Ensure components are explicitly passed to meta for Autodocs
      "storybook/csf-component": "error",
      // Mandate awaiting interactions in play functions for test stability
      "storybook/await-interactions": "error",
      // Prefer PascalCase for story names to match React conventions
      "storybook/prefer-pascal-case": "error",
    },
  },

  // 7. Code Uniformity and Organizational Rules
  {
    name: "Structural Organization",
    plugins: { perfectionist },
    rules: {
      // Sort imports naturally. Critical for finding dependencies in large components.
      "perfectionist/sort-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
          groups: [
            "type",
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "side-effect",
            "style",
          ],
        },
      ],
      // Alphabetical sorting of JSX props for scannability
      "perfectionist/sort-jsx-props": ["error", { type: "natural", order: "asc" }],
      // Prevent the use of default exports in component files
      "no-restricted-syntax":,
    },
  },

  // 8. Prettier Compatibility
  // This must always be the final object to override conflicting stylistic rules.
  prettierConfig
);


Line-by-Line Explanation of the Best-Practice Configuration
The configuration begins with a series of ESM imports. Unlike the previous "provided snippet," which might have used CJS require or relied on older plugin versions, this setup uses the latest standardized packages.8
The globalIgnores block (Lines 15-22) is the primary defensive layer. By excluding dist and build folders, it prevents ESLint from attempting to lint compiled code, which can lead to significant performance degradation and "memory leak" symptoms in large projects.7 This call is marked with a name ("Global Exclusion Patterns"), which improves the output of the --inspect-config CLI command.7
The Base Environment object (Lines 25-42) sets up the fundamental language options. It utilizes the globals package to explicitly define browser, node, and ES2021 global variables. This replaces the legacy env key, which is no longer supported in Flat Config.8 By setting ecmaVersion to "latest", the linter stays current with modern syntax without requiring manual updates.12
The Strict TypeScript block (Lines 46-77) leverages tseslint.config for internal type safety. The highlight here is the projectService: true setting (Line 66). This enables "Typed Linting," allowing ESLint to ask the TypeScript compiler about the actual types of variables.13 For a component library, this is essential for rules that prevent dangerous operations like passing the wrong props to an internal utility function. The tsconfigRootDir ensures that even in a monorepo, the parser correctly identifies the local tsconfig.json.13
In the React Architectural Standards section (Lines 80-109), the configuration uses the settings.react.version: "detect" option (Line 89). This is a best practice that ensures the library uses rules appropriate for the version of React specified in its package.json.15 The ruleset combines the recommended core React rules with the "JSX Runtime" rules, which are necessary for React 17+ to avoid errors regarding the missing import React from 'react'.15 The react/display-name rule (Line 104) is strictly enforced to ensure components are identifiable in production debugging tools.15
The Vite Fast Refresh section (Lines 112-126) is specifically tuned for the local development experience. The allowConstantExport: true option (Line 122) addresses a specific limitation of the React Refresh plugin. Without this, exporting a constant (like a configuration object) from a component file would trigger a linter warning. Vite, however, is capable of handling these exports safely, so enabling this option improves developer experience without compromising stability.19
The Storybook section (Lines 129-145) applies Storybook-specific rules only to .stories files.21 This isolation is a major advantage of the Flat Config system, as it prevents documentation-related rules from leaking into the core application logic. The enforcement of storybook/csf-component (Line 137) ensures that Storybook’s automated documentation features (Autodocs) have the necessary metadata to function.21
Finally, the Structural Organization section (Lines 148-180) introduces eslint-plugin-perfectionist. This replaces the more basic simple-import-sort used in previous snippets.22 Perfectionist provides more granular control over import grouping and can also sort JSX props alphabetically (Line 172).23 The addition of the no-restricted-syntax rule (Lines 174-180) codifies the architectural decision to favor named exports, which is vital for library tree-shakability.26
Improvements over Standard Snippets
The provided best-practice configuration introduces several critical improvements over basic "defineConfig" templates commonly found in online documentation.
Project Service Migration: Standard snippets often use the legacy parserOptions.project: true for TypeScript. The use of projectService in this configuration provides better performance and simpler configuration in multi-package repositories.13
Explicit Scoping: Unlike snippets that apply all rules to all files, this configuration uses the files array and explicit names for each config object. This makes it significantly easier to use the ESLint Config Inspector to debug why a specific rule is (or isn't) applying to a file.7
HMR Optimization: Many configurations leave out the allowConstantExport setting for react-refresh. By including it, this configuration prevents the "false positive" warnings that frequently annoy library developers when exporting theme constants or test data.19
Architectural Enforcement: While standard snippets focus on syntax, this configuration uses no-restricted-syntax to enforce the high-level architectural constraint of named exports, ensuring the library remains tree-shakeable for its consumers.26
Perfectionist over simple-import-sort: Perfectionist is more "aware" of comments and spread operators, making it a more robust choice for complex UI components than the simpler alternatives.23
Integrating SCSS Linting with Stylelint
A React UI library using SCSS requires a complementary linting strategy for styles. While ESLint handles the logical layer (.ts, .tsx), Stylelint handles the presentation layer (.scss).
The Flat Config Equivalent for Stylelint
Stylelint has also moved toward a standard configuration format. For a SCSS project, stylelint-config-standard-scss provides the necessary base, extending the standard CSS config with rules for Sass-specific features like mixins, variables, and nested rules.
Stylelint Feature
Importance in a Component Library
Key Package
Standard SCSS
Enforces consistent Sass syntax and best practices.
stylelint-config-standard-scss
Order Linting
Ensures properties are sorted logically (e.g., layout first).
stylelint-config-recess-order
BEM Enforcement
Guarantees that class names follow a predictable pattern.
stylelint-selector-bem-pattern

By using the recess-order plugin, the library can ensure that CSS properties are always written in the same order (e.g., position, display, box model, then color). This predictability makes the SCSS files much easier to maintain as the library grows.
Unified linting Scripts
To ensure both ESLint and Stylelint are executed consistently, they should be integrated into the project's package.json scripts. For a Vite-based project, the lint command should encompass both logic and styles.

JSON


"scripts": {
  "lint:js": "eslint. --fix",
  "lint:css": "stylelint \"src/**/*.scss\" --fix",
  "lint": "npm run lint:js && npm run lint:css"
}


Performance and Automation: Husky and lint-staged
In a scalable library environment, linting should not be an optional manual step. It must be automated to prevent regressions. This is typically achieved through the use of Git hooks, managed by Husky.
Pre-commit Orchestration
When a developer attempts to commit code, Husky triggers a pre-commit hook. Instead of linting the entire repository—which can be slow—the lint-staged utility is used to run linters only on the files that are currently staged in Git. This surgical approach ensures that the developer receives immediate feedback without the performance penalty of a full project scan.

Automation Tool
Function
Integration
Husky
Manages Git hooks within the Node.js ecosystem.
npx husky init
lint-staged
Runs scripts on only the files changed in the current commit.
22
CI/CD Pipeline
Provides a final "gate" to ensure no broken code is merged.
30

A typical .lintstagedrc.js file for this library might look like this:

JavaScript


export default {
  "*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.scss": [
    "stylelint --fix",
    "prettier --write"
  ]
};


This configuration ensures that every commit is both linted for logical errors and formatted for stylistic consistency, maintaining the "pristine" state of the library's codebase.
The Future of Linting: React Compiler and AI
The horizon of 2026 brings new challenges and opportunities for static analysis. The React Compiler is perhaps the most significant shift since the introduction of Hooks.
Adapting to the React Compiler
The React Compiler performs its own static analysis to determine if a component can be safely memoized. If the compiler identifies a violation of the Rules of React—such as a component that depends on global mutable state or a hook that is called conditionally—it will opt out of optimizing that component.
The eslint-plugin-react-compiler serves as a "compiler preview" in the IDE. It flags these violations in real-time, allowing developers to refactor their code to be compiler-friendly before the build even starts. For a component library, this means that the "cost" of React (re-renders) is minimized for all downstream users without requiring the users to manually wrap their code in useMemo or React.memo.
AI and the Model Context Protocol (MCP)
With ESLint v9.26.0 and beyond, the introduction of the MCP server flag (--mcp) allows AI-powered coding assistants (like Cursor, Claude Code, or GitHub Copilot) to interact directly with the ESLint engine. In the past, AI assistants would often suggest code that violated the project's specific linting rules, requiring the developer to manually fix the AI's mistakes. With MCP, the AI can validate its own suggestions against the project's real eslint.config.js before presenting them to the user. This ensures that the code generated by AI is architecturally sound and follows the library's established patterns from the moment of creation.
Conclusion and Recommendations
The transition to ESLint's Flat Config system, combined with the strict requirements of a React UI component library, necessitates a shift from casual linting to rigorous architectural enforcement. By understanding the underlying AST mechanisms and leveraging the latest v10 features like defineConfig, globalIgnores, and the projectService, library maintainers can create a linting environment that is both extremely powerful and highly performant.
The recommended configuration provided in this report serves as a blueprint for such a system. It prioritizes tree-shakability through named exports, ensures accessibility through jsx-a11y, and prepares the codebase for the future of React through the compiler plugin. Furthermore, by integrating these tools into an automated pre-commit workflow with Husky and lint-staged, the team can guarantee that the library remains a robust and reliable dependency for the entire ecosystem. As static analysis continues to integrate more deeply with compilers and AI models, the "linter" will increasingly act as the primary interface between the developer's intent and the machine's execution.
Works cited
Understanding ASTs Through Creating a Custom ESLint Rule - afro-cloud.com, accessed March 11, 2026, https://www.afro-cloud.com/blog/asts-and-eslint.html
Core Concepts - ESLint - Pluggable JavaScript Linter, accessed March 11, 2026, https://eslint.org/docs/latest/use/core-concepts/
Gettings started writing a ESLint rule - GitHub Gist, accessed March 11, 2026, https://gist.github.com/sindresorhus/1656c46f23545deff8cc713649dcff26
Getting Started - typescript-eslint, accessed March 11, 2026, https://typescript-eslint.io/getting-started/
Beginner's Guide to Custom ESLint Plugins - Brandon Scott, accessed March 11, 2026, https://brandonscott.me/posts/beginners-guide-to-custom-eslint-plugins/
Custom Rules - ESLint - Pluggable JavaScript Linter, accessed March 11, 2026, https://eslint.org/docs/latest/extend/custom-rules
Evolving flat config with extends - ESLint - Pluggable JavaScript Linter, accessed March 11, 2026, https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/
Modern Linting in 2025: ESLint Flat Config with TypeScript and JavaScript, accessed March 11, 2026, https://advancedfrontends.com/eslint-flat-config-typescript-javascript/
Configuration Migration Guide - ESLint - Pluggable JavaScript Linter, accessed March 11, 2026, https://eslint.org/docs/latest/use/configure/migration-guide
Upgrading Eslint from v8 to v9 in Vue.js - Vue School Articles, accessed March 11, 2026, https://vueschool.io/articles/vuejs-tutorials/upgrading-eslint-from-v8-to-v9-in-vue-js/
Configuration Files - ESLint - Pluggable JavaScript Linter, accessed March 11, 2026, https://eslint.org/docs/latest/use/configure/configuration-files
ESlint flat config - Medium, accessed March 11, 2026, https://medium.com/@oliviarizona/eslint-flat-config-e94d4bd11525
Linting with Type Information | typescript-eslint, accessed March 11, 2026, https://typescript-eslint.io/getting-started/typed-linting/
Blog | typescript-eslint, accessed March 11, 2026, https://typescript-eslint.io/blog
jsx-eslint/eslint-plugin-react: React-specific linting rules for ESLint - GitHub, accessed March 11, 2026, https://github.com/jsx-eslint/eslint-plugin-react
React Linting Best Practices: ESLint + Prettier Setup Guide - Propelius Technologies, accessed March 11, 2026, https://propelius.tech/blogs/best-practices-for-linting-react-code/
Eslint and Prettier configuration | by Manohar Batra - Medium, accessed March 11, 2026, https://medium.com/@contactmanoharbatra/eslint-and-prettier-configuration-f0259ebeb58b
The Best ESLint Rules for React Projects - DEV Community, accessed March 11, 2026, https://dev.to/timwjames/the-best-eslint-rules-for-react-projects-30i8
Renovate Bot Package Diff, accessed March 11, 2026, https://app.renovatebot.com/package-diff?name=eslint-plugin-react-refresh&from=0.4.11&to=0.4.16
react/node_modules/eslint-plugin-react-refresh · main · Hartmann / pokemon - GitLab, accessed March 11, 2026, https://gitinfo.cnam.fr/hartmann_clement/pokemon/-/tree/main/react/node_modules/eslint-plugin-react-refresh
ESLint plugin | Storybook docs, accessed March 11, 2026, https://storybook.js.org/docs/configure/integration/eslint-plugin
React Component Library with Vite and Deploy in NPM | by Bigyan Poudel, accessed March 11, 2026, https://articles.wesionary.team/react-component-library-with-vite-and-deploy-in-npm-579c2880d6ff
eslint-plugin-perfectionist | Yarn, accessed March 11, 2026, https://classic.yarnpkg.com/en/package/eslint-plugin-perfectionist
Getting Started - ESLint Plugin Perfectionist, accessed March 11, 2026, https://perfectionist.dev/guide/getting-started.html
sort-imports | ESLint Plugin Perfectionist, accessed March 11, 2026, https://perfectionist.dev/rules/sort-imports.html
Fixing ESLint: Import And No Default Export Errors - Broadwayinfosys, accessed March 11, 2026, https://ftp.broadwayinfosys.com/blog/fixing-eslint-import-and-no-default-export-errors-1767646615
How to configure ESLint so that it disallows default exports - Stack Overflow, accessed March 11, 2026, https://stackoverflow.com/questions/44378395/how-to-configure-eslint-so-that-it-disallows-default-exports
ESLint Plugin Perfectionist - Azat S., accessed March 11, 2026, https://azat.io/en/projects/eslint-plugin-perfectionist
React and typescript components lib, part 4: pre-commit with Husky and lint-staged - Dev.to, accessed March 11, 2026, https://dev.to/griseduardo/react-and-typescript-components-lib-part-4-pre-commit-with-husky-and-lint-staged-369n
Linting and Formatting TypeScript in 2025 - A Complete Guide | Finn Nannestad, accessed March 11, 2026, https://finnnannestad.com/blog/linting-and-formatting
How to Set Up Husky v9 in Your React Project to Automate Code Quality Checks - Medium, accessed March 11, 2026, https://medium.com/@mehran13mome/how-to-set-up-husky-v9-in-your-react-project-to-automate-code-quality-checks-57818f1a63b0
