import js from "@eslint/js";
import unusedImports from "eslint-plugin-unused-imports";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import prettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                myCustomGlobal: "readonly",
            },
        },
        plugins: {
            "unused-imports": unusedImports,
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            prettier: prettier,
            "@typescript-eslint": tseslint.plugin,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            "prettier/prettier": "error",

            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "react/jsx-uses-vars": "error",
            "react/prop-types": "off",

            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            "no-undef": "off", // TypeScript handles this
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",

            "unused-imports/no-unused-imports": "error",
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

            // TypeScript-specific rules
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-non-null-assertion": "warn",
        },
    },
    {
        ignores: ["build/**", "dist/**", "node_modules/**"],
    }
);
