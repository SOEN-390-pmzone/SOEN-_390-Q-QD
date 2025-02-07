import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginJest from "eslint-plugin-jest";


/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.jest },
    },
  },

  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/__tests__/**/*.{js,mjs,cjs,jsx}", "**/*.test.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: { ...globals.jest }, // Add Jest globals
    },
    plugins: { jest: pluginJest },
    rules: {
      ...pluginJest.configs.recommended.rules,
    },
  },
];
