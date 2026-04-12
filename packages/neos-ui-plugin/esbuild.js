const esbuild = require('esbuild');
const extensibilityMap = require('@neos-project/neos-ui-extensibility/extensibilityMap.json');
const isWatch = process.argv.includes('--watch');

/** @type {import("esbuild").BuildOptions} */
const options = {
    logLevel: 'info',
    bundle: true,
    // we don't minify identifiers as with css modules another plugin is likely to override them https://github.com/evanw/esbuild/issues/3484
    minifyIdentifiers: false,
    minifySyntax: !isWatch,
    minifyWhitespace: !isWatch,
    sourcemap: 'linked',
    legalComments: 'linked',
    target: 'es2020',
    entryPoints: {
        Plugin: './src/manifest.js',
    },
    outdir: '../../Resources/Public/AssetEditor',
    alias: extensibilityMap,
};

if (isWatch) {
    esbuild.context(options).then((ctx) => ctx.watch());
} else {
    esbuild.build(options);
}
