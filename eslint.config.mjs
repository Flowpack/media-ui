import js from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { FlatCompat } from '@eslint/eslintrc';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default [
    globalIgnores([
        '**/dist/**',
        '**/build/**',
        '.cache',
        '**/esbuild.js',
    ]),
    js.configs.recommended,
    ...tsEslint.configs.recommended,
    // legacy shareable configs patchen
    ...fixupConfigRules(
        compat.extends(
            'plugin:react/recommended',
            'plugin:testcafe/recommended',
        ),
    ),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: tsEslint.parser,
            ecmaVersion: 2020,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': tsEslint.plugin,
            'react-hooks': fixupPluginRules(reactHooks),
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    args: 'none',
                },
            ],
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'no-unused-vars': 'off',
            'prettier/prettier': ['error'],
            'react/prop-types': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': [
                'warn',
                {
                    additionalHooks: 'useRecoilCallback',
                },
            ],
        },
    },

    // should stay last
    prettierRecommended,
];
