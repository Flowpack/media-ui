const esbuild = require('esbuild');
const CssModulesPlugin = require('esbuild-css-modules-plugin');
const extensibilityMap = require('@neos-project/neos-ui-extensibility/extensibilityMap.json');
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
    alias: extensibilityMap,
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
