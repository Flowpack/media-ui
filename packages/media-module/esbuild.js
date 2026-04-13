const esbuild = require('esbuild');
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
    entryPoints: {
        'main.bundle': './src/index.tsx',
    },
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
