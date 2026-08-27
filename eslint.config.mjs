import js from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import * as graphqlEslint from '@graphql-eslint/eslint-plugin';
import { FlatCompat } from '@eslint/eslintrc';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

// GraphQL schema used to validate the operations embedded in `gql` template literals.
// The parser loads it from the `graphql.config.yml` at the project root (also referenced by
// `apollo.config.js` via `localSchemaFile`).
const graphqlSchemaRules = {
    '@graphql-eslint/executable-definitions': 'error',
    '@graphql-eslint/fields-on-correct-type': 'error',
    '@graphql-eslint/fragments-on-composite-type': 'error',
    '@graphql-eslint/known-argument-names': 'error',
    '@graphql-eslint/known-directives': [
        'error',
        { ignoreClientDirectives: ['client', 'export'] },
    ],
    '@graphql-eslint/known-fragment-names': 'error',
    '@graphql-eslint/known-type-names': 'error',
    '@graphql-eslint/no-undefined-variables': 'error',
    '@graphql-eslint/possible-fragment-spread': 'error',
    '@graphql-eslint/provided-required-arguments': 'error',
    '@graphql-eslint/scalar-leafs': 'error',
    '@graphql-eslint/unique-argument-names': 'error',
    '@graphql-eslint/unique-variable-names': 'error',
    '@graphql-eslint/value-literals-of-correct-type': 'error',
    '@graphql-eslint/variables-are-input-types': 'error',
    '@graphql-eslint/variables-in-allowed-position': 'error',
};

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

    // Extract GraphQL documents embedded in `gql`/`graphql` template literals and lint them
    {
        files: ['**/*.{ts,tsx}'],
        processor: graphqlEslint.processors['graphql'],
    },
    {
        files: ['**/*.graphql'],
        ignores: ['**/Resources/Private/GraphQL/schema.root.graphql'],
        languageOptions: {
            parser: graphqlEslint.parser,
        },
        plugins: {
            '@graphql-eslint': graphqlEslint,
        },
        rules: graphqlSchemaRules,
    },

    // Apollo Client schema definition files (`typeDefs.ts`) declare SDL (types, directives,
    // type extensions), not executable operations, so the `executable-definitions` operation
    // rule does not apply to the GraphQL blocks plucked from them.
    {
        files: ['**/typeDefs.{ts,tsx}/**'],
        rules: {
            '@graphql-eslint/executable-definitions': 'off',
        },
    },

    {
        settings: {
            react: {
                version: '17.0',
            },
        },
    },

    // should stay last
    prettierRecommended,
];
