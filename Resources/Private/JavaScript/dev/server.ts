const fs = require('fs');
const path = require('path');
const { gql } = require('apollo-boost');
const Bundler = require('parcel-bundler');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const PORT = 8000;

const bundler = new Bundler(__dirname + '/index.html', {
    outDir: __dirname + '/dist'
});

const assetSources = [
    {
        id: 'neos',
        label: 'Neos',
        description: 'The Neos core asset source',
        iconUri: '',
        readOnly: false,
        supportsTagging: true,
        supportsCollections: true
    }
];

const assets = [
    {
        id: 1,
        localId: 1,
        assetSource: assetSources[0],
        imported: false,
        label: 'Dummy 1',
        caption: 'The caption for dummy 1',
        filename: 'dummy1.jpg',
        tags: [],
        collections: [],
        copyrightNotice: 'The Neos team',
        lastModified: '2020-06-16 15:07:00',
        iptcProperties: [],
        width: 90,
        height: 210,
        file: {
            extension: 'jpg',
            mediaType: 'image/jpeg',
            typeIcon: {
                width: 16,
                height: 16,
                url: 'jpg.svg',
                alt: 'jpeg image'
            },
            size: '200',
            url: 'Assets/dummy1.jpg'
        },
        thumbnailUrl: 'Assets/dummy1.jpg',
        previewUrl: 'Assets/dummy1.jpg'
    }
];

const resolvers = {
    Query: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        assets: (assetSourceId, tag, assetCollectionId, mediaType, searchTerm, limit, offset) => assets,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        assetCount: (assetSourceId, tag, assetCollectionId, mediaType, searchTerm) => assets.length,
        assetSources: () => assetSources,
        assetCollections: () => [],
        tags: () => [],
        config: () => ({
            uploadMaxFileSize: 1024 * 1024
        })
    }
};

const typeDefs = gql`
    ${fs.readFileSync(path.join(__dirname, '../../GraphQL/schema.root.graphql'), 'utf8')}
`;

const server = new ApolloServer({ typeDefs, resolvers, uploads: false });
const app = express();

server.applyMiddleware({ app, path: '/graphql' });

app.use(express.static(path.join(__dirname, 'public')));

app.use(bundler.middleware());

app.listen(PORT, () => {
    console.info(
        `Media Module dev server running at http://localhost:${PORT} and GraphQL at http://localhost:${PORT}${server.graphqlPath}`
    );
});
