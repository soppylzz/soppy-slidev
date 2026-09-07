import { defineConfig } from "eslint/config"
import globals from "globals"
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import importPlugin from "eslint-plugin-import"
import { default as jsonc } from "eslint-plugin-jsonc"
import vue from "eslint-plugin-vue"
import vueParser from "vue-eslint-parser"
import prettier from "eslint-config-prettier"

export default defineConfig([
  /* =============== ignores =============== */
  {
    // must include "**/" wildcard to ignore `dist`, `node_modules` at all levels
    ignores: ["**/dist", "**/node_modules"],
  },

  {
    files: ["**/*.{js,ts,mjs,cjs}"],
    rules: {
      /**
       * fix: unable to resolve:
       * - "eslint/config", "typescript-eslint" in this file
       * - style import
       */
      "import/no-unresolved": [
        "error",
        { ignore: ["eslint/config", "typescript-eslint", "\\.css$", "\\.scss$"] },
      ],
    },
  },

  /* =============== extends =============== */
  ...jsonc.configs["recommended-with-json5"],
  ...jsonc.configs.prettier,

  js.configs.recommended,
  ...tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,

  ...vue.configs["flat/recommended"],

  {
    files: ["**/*.{js,ts,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2026,
      },
    },
  },

  {
    rules: {
      "import/no-unresolved": "off",
      "import/no-named-as-default": "off",
    },
  },

  /* =============== json rules =============== */
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        // set tsParser
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
      globals: { ...globals.browser },
    },
    rules: {
      "vue/no-v-html": "warn",
      "vue/require-default-prop": "off",
    },
  },

  /* =============== json rules =============== */
  {
    files: ["**/*.{json,jsonc,json}"],
    languageOptions: {
      parser: jsonc,
    },
  },

  /* =============== ts rules =============== */
  {
    files: ["**/*.ts", "**/*.vue"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          disallowTypeAnnotations: true,
          fixStyle: "separate-type-imports",
          prefer: "type-imports",
        },
      ],
    },
  },

  // disable prettier rules to avoid conflicts with other rules
  prettier,
])
