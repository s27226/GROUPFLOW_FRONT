import js from "@eslint/js";
import unusedImports from "eslint-plugin-unused-imports";
import babelEslint from "@babel/eslint-parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parser: babelEslint,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"], // enable JSX
        },
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        navigator: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      "unused-imports": unusedImports,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React rules - CRITICAL: Must come BEFORE unused-imports check
      "react/jsx-uses-react": "off", // Not needed with new JSX transform
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
      "react/jsx-uses-vars": "error", // MUST be error - marks JSX components as used
      "react/prop-types": "off",
      
      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // General rules - Must be set before unused-imports
      "no-undef": "error", // Catch undefined variables
      "no-unused-vars": "off", // MUST be off - conflicts with unused-imports
      
      // Import rules - Now safe because react plugin marks JSX vars as used
      "unused-imports/no-unused-imports": "error", // Removes unused imports
      "unused-imports/no-unused-vars": [
        "warn",
        { 
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
