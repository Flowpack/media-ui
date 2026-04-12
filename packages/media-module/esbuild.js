const esbuild = require('esbuild');
const isWatch = process.argv.includes('--watch');

/** @type {import("esbuild").BuildOptions} */
const options = {
    logLevel: 'info',
    bundle: true,
    minify: !isWatch,
    sourcemap: 'linked',
    legalComments: 'linked',
    target: 'es2020',
    entryPoints: {
        'main.bundle': './src/index.tsx',
    },
    outdir: '../../Resources/Public/Assets',
};

if (isWatch) {
    esbuild.context(options).then((ctx) => ctx.watch());
} else {
    esbuild.build(options);
}
