import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
    {
        ignores: ['dist/', 'node_modules/'],
    },
    // Base config for all files
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,

    // Browser globals for most files
    {
        files: ['**/*.{js,ts}'],
        languageOptions: { globals: globals.browser },
    },
];
