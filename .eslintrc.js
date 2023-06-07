module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: { jsx: true },
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:testcafe/recommended',
        'plugin:prettier/recommended',
    ],
    plugins: ['@typescript-eslint', 'testcafe', 'prettier', 'react', 'react-hooks'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    env: {
        browser: true,
        es2020: true,
        node: true,
    },
    ignorePatterns: ['.cache', '.parcel-cache', 'dist'],
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                args: 'none', // FIXME: Eslint shows warnings for used interfaces
            },
        ],
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'no-unused-vars': 'off',
        'prettier/prettier': ['error'],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': [
            'warn',
            {
                additionalHooks: 'useRecoilCallback',
            },
        ],
    },
};
