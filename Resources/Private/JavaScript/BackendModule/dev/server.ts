import fs from 'fs';
import path from 'path';
import Bundler from 'parcel-bundler';
import { gql } from '@apollo/client';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';

import { loadFixtures } from './fixtures';
import { Tag } from '../src/interfaces';

const PORT = 8000;

const bundler = new Bundler(__dirname + '/index.html', {
    outDir: __dirname + '/dist',
});

let { assets, assetCollections, assetSources, tags } = loadFixtures();

const filterAssets = (assetSourceId = '', tag = '', assetCollection = '', mediaType = '', searchTerm = '') => {
    return assets.filter((asset) => {
        return (
            (!assetSourceId || asset.assetSource.id === assetSourceId) &&
            (!tag || asset.tags.find(({ label }) => label === tag)) &&
            (!assetCollection || asset.collections.find(({ title }) => title === assetCollection)) &&
            (!searchTerm || asset.label.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) &&
            (!mediaType || asset.file.mediaType.indexOf(mediaType) >= 0)
        );
    });
};

const resolvers = {
    Query: {
        asset: ($_, { id, assetSourceId = 'neos' }) =>
            assets.find((asset) => asset.id === id && asset.assetSource.id === assetSourceId),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        assets: (
            $_,
            {
                assetSourceId = 'neos',
                tag = null,
                assetCollection = null,
                mediaType = '',
                searchTerm = '',
                limit = 20,
                offset = 0,
            }
        ) => filterAssets(assetSourceId, tag, assetCollection, mediaType, searchTerm).slice(offset, offset + limit),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        assetCount: (
            $_,
            { assetSourceId = 'neos', tag = null, assetCollection = null, mediaType = '', searchTerm = '' }
        ) => {
            return filterAssets(assetSourceId, tag, assetCollection, mediaType, searchTerm).length;
        },
        assetSources: () => assetSources,
        assetCollections: () => assetCollections,
        assetCollection: ($_, { id }) => assetCollections.find((assetCollection) => assetCollection.id === id),
        tags: () => tags,
        tag: ($_, { id }) => tags.find((tag) => tag.id === id),
        config: () => ({
            uploadMaxFileSize: 1024 * 1024,
        }),
    },
    Mutation: {
        updateAsset: ($_, { id, assetSourceId, label, caption, copyrightNotice }) => {
            const asset = assets.find((asset) => asset.id === id && asset.assetSource.id === assetSourceId);
            asset.label = label;
            asset.caption = caption;
            asset.copyrightNotice = copyrightNotice;
            return asset;
        },
        setAssetTags: ($_, { id, assetSourceId, tagIds }: { id: string; assetSourceId: string; tagIds: string[] }) => {
            const asset = assets.find((asset) => asset.id === id && asset.assetSource.id === assetSourceId);
            asset.tags = tags.filter((tag) => tagIds.includes(tag.id));
            return asset;
        },
        setAssetCollections: (
            $_,
            {
                id,
                assetSourceId,
                assetCollectionIds: newAssetCollectionIds,
            }: { id: string; assetSourceId: string; assetCollectionIds: string[] }
        ) => {
            const asset = assets.find((asset) => asset.id === id && asset.assetSource.id === assetSourceId);
            asset.collections = assetCollections.filter((collection) => newAssetCollectionIds.includes(collection.id));
            return asset;
        },
        deleteTag: ($_, { id: id }) => {
            tags.splice(
                tags.findIndex((tag) => tag.id === id),
                1
            );
            return true;
        },
        createTag: ($_, { tag: newTag }: { tag: Tag }) => {
            if (!tags.find((tag) => tag === newTag)) {
                tags.push(newTag);
                return newTag;
            }
            return null;
        },
    },
};

const typeDefs = gql`
    ${fs.readFileSync(path.join(__dirname, '../../../GraphQL/schema.root.graphql'), 'utf8')}
`;

const server = new ApolloServer({ typeDefs, resolvers, uploads: false });
const app = express();

server.applyMiddleware({ app, path: '/graphql' });

app.use((req, res, next) => {
    if (req.query.reset) {
        const fixtures = loadFixtures();
        assets = fixtures.assets;
        assetCollections = fixtures.assetCollections;
        tags = fixtures.tags;
        assetSources = fixtures.assetSources;
        console.log('Fixtures have been reset');
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(bundler.middleware());

app.listen(PORT, () => {
    console.info(
        `Media Module dev server running at http://localhost:${PORT} and GraphQL at http://localhost:${PORT}${server.graphqlPath}`
    );
});
