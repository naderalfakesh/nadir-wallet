// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

// Shared layers sit below the app: features, providers and routes may import
// them, never the other way round.
const SHARED_LAYERS = "src/{components,services,theme,utils,i18n,types,constants}/**/*.{ts,tsx}";

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // One import order everywhere: packages, workspace packages, "@/" alias, relative.
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          pathGroups: [
            { pattern: "{react,react-native}", group: "external", position: "before" },
            { pattern: "@nadir-wallet/**", group: "internal", position: "before" },
            { pattern: "@/**", group: "internal" },
          ],
          pathGroupsExcludedImportTypes: ["react", "react-native"],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "never",
        },
      ],
    },
  },
  {
    files: [SHARED_LAYERS],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/providers/*", "@/app/*"],
              message: "Shared layers must not import from features, providers or routes.",
            },
          ],
        },
      ],
    },
  },
]);
