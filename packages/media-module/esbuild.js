const esbuild = require('esbuild');
const path = require('path');
const CssModulesPlugin = require("esbuild-css-modules-plugin");
const isWatch = process.argv.includes('--watch');
const isAnalyze = process.argv.includes('--analyze');

/** @type {import("esbuild").BuildOptions} */
const options = {
    logLevel: 'info',
    bundle: true,
    minify: !isWatch,
    sourcemap: 'linked',
    legalComments: 'linked',
    target: 'es2020',
    metafile: isAnalyze,
    mainFields: ['browser', 'module', 'main'],
    alias: {
        // Multiple subpackages (core, features, media-module) each install a physical
        // @apollo/client under their own node_modules because the root graphql peer is v16
        // (lint-only) while @apollo/client needs graphql v15. Bundling those distinct copies
        // would yield two Apollo instances and break Apollo's React context, so pin the whole
        // bundle to the single copy media-module resolves with its peer-satisfied graphql@15.
        '@apollo/client': path.resolve(__dirname, 'node_modules/@apollo/client'),
        graphql: path.resolve(__dirname, 'node_modules/graphql'),
    },
    entryPoints: {
        'main.bundle': './src/index.tsx',
    },
    plugins: [
        CssModulesPlugin({
            // @see https://github.com/indooorsman/esbuild-css-modules-plugin/blob/main/index.d.ts for more details
            force: true,
            localsConvention: 'camelCaseOnly',
            namedExports: true,
            inject: false,
        }),
    ],
    outdir: '../../Resources/Public/Assets',
    define: {
        // react-image-lightbox
        global: 'window',
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
