const esbuild = require('esbuild');
const CssModulesPlugin = require('esbuild-css-modules-plugin');
const extensibilityMap = require('@neos-project/neos-ui-extensibility/extensibilityMap.json');
const path = require('path');
const isWatch = process.argv.includes('--watch');
const isAnalyze = process.argv.includes('--analyze');

/** @type {import("esbuild").BuildOptions} */
const options = {
    logLevel: 'info',
    bundle: true,
    sourcemap: 'linked',
    minify: !isWatch,
    legalComments: 'linked',
    target: 'es2020',
    mainFields: ['browser', 'module', 'main'],
    metafile: isAnalyze,
    entryPoints: {
        Plugin: './src/manifest.js',
    },
    outdir: '../../Resources/Public/AssetEditor',
    define: {
        // react-image-lightbox
        global: 'window',
    },
    plugins: [
        CssModulesPlugin({
            // we cant use esbuild local-css feature as the resulting CSS classes are likely overridden by another plugin https://github.com/evanw/esbuild/issues/3484
            pattern: `media-[hash]_[local]`,
            force: true,
            localsConvention: 'camelCaseOnly',
            namedExports: true,
            inject: false,
        }),
    ],
    alias: {
        ...extensibilityMap,
        // Multiple subpackages (core, features, media-module) each install a physical
        // @apollo/client under their own node_modules because the root graphql peer is v16
        // (lint-only) while @apollo/client needs graphql v15. Bundling those distinct copies
        // would yield two Apollo instances and break Apollo's React context, so pin the whole
        // bundle to the single copy media-module resolves with its peer-satisfied graphql@15.
        '@apollo/client': path.resolve(__dirname, '../media-module/node_modules/@apollo/client'),
        graphql: path.resolve(__dirname, '../media-module/node_modules/graphql'),
    },
};

if (isWatch) {
    esbuild.context(options).then((ctx) => ctx.watch());
} else {
    esbuild.build(options).then((result) => {
        if (isAnalyze) {
            require('fs').writeFileSync('meta.json', JSON.stringify(result.metafile));
            console.log("\nUpload './meta.json' to https://esbuild.github.io/analyze/ to analyze the bundle.");
        }
    });
}
