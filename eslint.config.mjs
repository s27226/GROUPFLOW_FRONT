import js from "@eslint/js";
import unusedImports from "eslint-plugin-unused-imports";
import babelEslint from "@babel/eslint-parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import prettier from "eslint-plugin-prettier";

export default [
    js.configs.recommended,
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            parser: babelEslint,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    presets: ["@babel/preset-react"],
                },
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
            "react/prop-types": "off",

            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            "no-undef": "error",
            "no-unused-vars": "off",

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
        },
    },
];
