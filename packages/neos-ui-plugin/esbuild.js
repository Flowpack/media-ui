const esbuild = require('esbuild');
const CssModulesPlugin = require('esbuild-css-modules-plugin');
const extensibilityMap = require('@neos-project/neos-ui-extensibility/extensibilityMap.json');
const isWatch = process.argv.includes('--watch');

/** @type {import("esbuild").BuildOptions} */
const options = {
    logLevel: 'info',
    bundle: true,
    sourcemap: 'linked',
    minify: !isWatch,
    legalComments: 'linked',
    target: 'es2020',
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
            // @see https://github.com/indooorsman/esbuild-css-modules-plugin/blob/main/index.d.ts for more details
            force: true,
            localsConvention: 'camelCaseOnly',
            namedExports: true,
            inject: false,
        }),
    ],
    alias: extensibilityMap,
};

if (isWatch) {
    esbuild.context(options).then((ctx) => ctx.watch());
} else {
    esbuild.build(options);
}
