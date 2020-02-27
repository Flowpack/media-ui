const Bundler = require('parcel-bundler');
const Express = require('express');

const bundler = new Bundler(__dirname + '/Resources/Private/JavaScript/src/index.html', {
    outDir: __dirname + '/dist'
});

const app = Express();
app.use(Express.static(__dirname + '/public'));

app.get('/graphql.json', (req, res) => {
    res.json([]);
});

app.use(bundler.middleware());

app.listen(1234, () => {
    console.log(`Server running at http://localhost:1234`);
});
