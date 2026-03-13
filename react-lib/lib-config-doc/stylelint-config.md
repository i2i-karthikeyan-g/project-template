/** @type {import('stylelint').Config} */
export default {

  // 1. Extends standard SCSS rules and introduces automatic, fixable property ordering.
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-recess-order"
  ],

  // 2. Ensures Stylelint parses SCSS files safely.
  customSyntax: "postcss-scss",

  // 3. Ignore build outputs, dependencies, and Storybook static files.
  ignoreFiles: [
    "dist/**",
    "node_modules/**",
    "storybook-static/**"
  ],

  // 4. Quality of Life: Forces developers to clean up their stylelint-disable comments
  // if they are no longer needed or lack a description explaining WHY they disabled the rule.
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,

  rules: {

    /* --- NAMING --- */

    // Enforce strict BEM naming convention for classes (block__element--modifier).
   // block
//block__element
//block--modifier
    // This prevents arbitrary class names and keeps the CSS modular.
    "selector-class-pattern":
      "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9-]+)?(--[a-z0-9-]+)?$",

    // Completely ban ID selectors. Design systems must rely entirely on classes for reusability.
    "selector-max-id": 0,

    /* --- TOKEN PREFIX --- */

    // Ensure all custom CSS variables start with the '--ds-' prefix AND use kebab-case.
    "custom-property-pattern": "^ds-[a-z0-9-]+$",

    /* --- ENFORCE TOKENS --- */

    // Disallow raw hex colors (e.g., #FFFFFF). Force token usage.
    "color-no-hex": true,
    // Disallow named colors (e.g., 'red', 'blue').
    "color-named": "never",

    // Act as a strict bouncer for property values to guarantee design token usage.
    "declaration-property-value-allowed-list": {

      // Colors must use ds variables, OR native transparent/currentColor/inherit.
      // Covers color, background-color, border-color, etc.
      "/color/": ["/^var\\(--ds-/", "transparent", "currentColor", "inherit"],

      // Backgrounds can be complex (e.g. background: url(...) no-repeat), but if it's a simple color, it should be a token.
      // If you only want to enforce simple background colors, background-color is handled by /color/ above.
      // For the shorthand `background`, we allow var(--ds-), none, transparent, and inherit.
      // We must restrict it here to prevent `background: red;` or `background: #fff;`
      "background": ["/^var\\(--ds-/", "none", "transparent", "inherit"],

      // Spacing must use ds variables, OR structural layout values like 0 and auto.
      "/padding|margin|gap/": [
        "/^var\\(--ds-spacing-/", 
        "0", 
        "auto", 
        "inherit"
      ],

      // Z-index must use ds variables, OR standard stacking contexts like 0, -1, auto.
      "z-index": [
        "/^var\\(--ds-z-/",
        "auto",
        "0",
        "-1"
      ],

      // Border radius must use ds variables, OR specific layout numbers.
      "border-radius": ["/^var\\(--ds-radius-/", "0", "50%", "inherit"],

      // Typography must use ds variables to prevent arbitrary sizes.
      "font-size": ["/^var\\(--ds-font-size-/", "inherit"],
      "font-weight": ["/^var\\(--ds-font-weight-/", "inherit"],

      // Shadows must use ds variables.
      "box-shadow": ["/^var\\(--ds-shadow-/", "none", "inherit"]
    },

    /* --- QUALITY --- */

    // Ban the use of !important to prevent specificity wars and overriding nightmares.
    "declaration-no-important": true,

    // Disallow vendor prefixes in source code; let PostCSS/Autoprefixer handle them.
    "property-no-vendor-prefix": true,
    "value-no-vendor-prefix": true,

    // Cap nesting depth to prevent overly specific and unreadable selectors.
    // Reduced from 4 to 3 to enforce flatter BEM structures.
    "max-nesting-depth": 3,

    // Disable this rule because it often gives false positives with nested BEM component structures.
    "no-descending-specificity": null,

    /* --- SCSS RESTRICTIONS --- */

    // Ban SCSS variables ($var) by requiring an impossible regex pattern. Forces CSS variables.
    "scss/dollar-variable-pattern": "^__forbidden__$",

    // Ban SCSS logic, mixins, and extends. Keeps SCSS strictly for nesting purposes.
    "at-rule-disallowed-list": [
      [
        "extend",
        "mixin",
        "include",
        "function",
        "if",
        "else",
        "for",
        "each",
        "while",
        "return"
      ],
      { message: "SCSS features like mixins and logic are banned. Use plain CSS with nesting." }
    ]
  },

  // Relax token-enforcement rules ONLY inside the actual token/theme definition files.
  // This allows you to map raw hex values and pixels to your root CSS variables.
  overrides: [
    {
      files: [
        "**/tokens/**/*.{css,scss}",
        "**/themes/**/*.{css,scss}"
      ],
      rules: {
        "color-no-hex": null,
        "color-named": null,
        "declaration-property-value-allowed-list": null
      }
    }
  ]
};