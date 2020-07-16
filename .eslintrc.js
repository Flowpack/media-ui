module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:@typescript-eslint/recommended',
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:testcafe/recommended',
        'plugin:prettier/recommended',
        'prettier/@typescript-eslint'
    ],
    plugins: [
        'testcafe',
        'prettier',
        'react',
        'react-hooks'
    ],
    settings: {
        react: {
            version: 'detect'
        }
    },
    env: {
        browser: true,
        es6: true,
        node: true
    },
    ignorePatterns: ['.cache', 'dist', 'node_modules/'],
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        'prettier/prettier': ['error'],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': [
            'warn',
            {
                additionalHooks: 'useRecoilCallback'
            }
        ]
    }
};
