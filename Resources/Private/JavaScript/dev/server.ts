import fs from 'fs';
import path from 'path';
import Bundler from 'parcel-bundler';
import gql from 'graphql-tag';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';

import { assetCollections, assets, assetSources, tags } from './fixtures';

const PORT = 8000;

const bundler = new Bundler(__dirname + '/index.html', {
    outDir: __dirname + '/dist'
});

const filterAssets = (assetSourceId, tag, assetCollectionId, mediaType, searchTerm) => {
    return assets.filter(asset => {
        return (
            (!assetSourceId || asset.assetSource.id === assetSourceId) &&
            (!tag || asset.tags.find(({ label }) => label === tag)) &&
            (!assetCollectionId || asset.collections.find(({ title }) => title === assetCollectionId)) &&
            (!searchTerm || asset.label.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) &&
            (!mediaType || asset.file.mediaType.indexOf(mediaType) >= 0)
        );
    });
};

const resolvers = {
    Query: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        assets: (
            $_,
            {
                assetSourceId = 'neos',
                tag = null,
                assetCollectionId = null,
                mediaType = '',
                searchTerm = '',
                limit = 20,
                offset = 0
            }
        ) => filterAssets(assetSourceId, tag, assetCollectionId, mediaType, searchTerm).slice(offset, offset + limit),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        assetCount: (
            $_,
            { assetSourceId = 'neos', tag = null, assetCollectionId = null, mediaType = '', searchTerm = '' }
        ) => {
            return filterAssets(assetSourceId, tag, assetCollectionId, mediaType, searchTerm).length;
        },
        assetSources: () => assetSources,
        assetCollections: () => assetCollections,
        tags: () => tags,
        config: () => ({
            uploadMaxFileSize: 1024 * 1024
        })
    },
    Mutation: {
        updateAsset: ($_, { id, assetSourceId, label, caption, copyrightNotice }) => {
            const asset = assets.find(asset => asset.id === id && asset.assetSource.id === assetSourceId);
            asset.label = label;
            asset.caption = caption;
            asset.copyrightNotice = copyrightNotice;
            return asset;
        },
        setAssetTags: (
            $_,
            { id, assetSourceId, tags: newTags }: { id: string; assetSourceId: string; tags: string[] }
        ) => {
            const asset = assets.find(asset => asset.id === id && asset.assetSource.id === assetSourceId);
            asset.tags = tags.filter(tag => newTags.includes(tag.label));
            return asset;
        }
    }
};

const typeDefs = gql`
    ${fs.readFileSync(path.join(__dirname, '../../GraphQL/schema.root.graphql'), 'utf8')}
`;

// @ts-ignore
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
