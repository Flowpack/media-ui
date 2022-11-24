const fs = require('fs');
const path = require('path');
const Bundler = require('parcel-bundler');
const { gql } = require('@apollo/client');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const Fixtures = require('./fixtures');

// FIXME: type annotations are missing as they couldn't be included anymore while making the devserver work again
// import { Tag } from '@media-ui/core/src/interfaces';
// import { AssetChange, AssetChangeQueryResult, AssetChangeType } from '@media-ui/feature-concurrent-editing/src';

(async () => {
    const PORT = 8000;

    const bundler = new Bundler(path.resolve(__dirname, './index.html'), {
        outDir: path.resolve(__dirname, '../dist'),
    });

    let { assets, assetCollections, assetSources, tags } = Fixtures.loadFixtures();

    const filterAssets = (assetSourceId = '', tagId = '', assetCollectionId = '', mediaType = '', searchTerm = '') => {
        return assets.filter((asset) => {
            return (
                (!assetSourceId || asset.assetSource.id === assetSourceId) &&
                (!tagId || asset.tags.find(({ id }) => id === tagId)) &&
                (!assetCollectionId || asset.collections.find(({ id }) => id === assetCollectionId)) &&
                (!searchTerm || asset.label.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) &&
                (!mediaType || mediaType === 'all' || asset.file.mediaType.indexOf(mediaType) >= 0)
            );
        });
    };

    const sortAssets = (assets, sortBy, sortDirection) => {
        const sorted = assets.sort((a, b) => {
            if (sortBy === 'name') {
                // Using the label here since teh filename is the same in every fixture
                return a['label'].localeCompare(b['label']);
            }
            return new Date(a['lastModified']).getTime() - new Date(b['lastModified']).getTime();
        });

        return sortDirection === 'DESC' ? sorted.reverse() : sorted;
    };

    const changedAssetsResponse = {
        changedAssets: {
            lastModified: null,
            changes: [],
        },
    };

    const addAssetChange = (change) => {
        changedAssetsResponse.changedAssets.lastModified = change.lastModified;
        changedAssetsResponse.changedAssets.changes.push(change);
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
                    tagId = null,
                    assetCollectionId = null,
                    mediaType = '',
                    searchTerm = '',
                    limit = 20,
                    offset = 0,
                    sortBy = 'lastModified',
                    sortDirection = 'DESC',
                }
            ) =>
                sortAssets(
                    filterAssets(assetSourceId, tagId, assetCollectionId, mediaType, searchTerm).slice(
                        offset,
                        offset + limit
                    ),
                    sortBy,
                    sortDirection
                ),
            unusedAssets: ($_, { limit = 20, offset = 0 }) =>
                assets.filter(({ isInUse }) => !isInUse).slice(offset, offset + limit),
            unusedAssetCount: () => assets.filter(({ isInUse }) => !isInUse).length,
            changedAssets: ($_, { since }) => {
                const { lastModified, changes } = changedAssetsResponse.changedAssets;
                since = since ? new Date(since) : null;

                return {
                    lastModified,
                    changes: since ? changes.filter((change) => change.lastModified > since) : changes,
                };
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            assetCount: (
                $_,
                { assetSourceId = 'neos', tagId = null, assetCollectionId = null, mediaType = '', searchTerm = '' }
            ) => {
                return filterAssets(assetSourceId, tagId, assetCollectionId, mediaType, searchTerm).length;
            },
            assetUsageDetails: ($_, { id }) => {
                return Fixtures.getUsageDetailsForAsset(id);
            },
            assetSources: () => assetSources,
            assetCollections: () => assetCollections,
            assetCollection: ($_, { id }) => assetCollections.find((assetCollection) => assetCollection.id === id),
            tags: () => tags,
            tag: ($_, { id }) => tags.find((tag) => tag.id === id),
            config: () => ({
                uploadMaxFileSize: 1024 * 1024,
                uploadMaxFileUploadLimit: 2,
                currentServerTime: new Date(),
            }),
        },
        Mutation: {
            updateAsset: ($_, { id, assetSourceId, label, caption, copyrightNotice }) => {
                const asset = assets.find((asset) => asset.id === id && asset.assetSource.id === assetSourceId);
                asset.label = label;
                asset.caption = caption;
                asset.copyrightNotice = copyrightNotice;
                asset.lastModified = new Date();
                addAssetChange({
                    lastModified: asset.lastModified,
                    assetId: id,
                    type: 'ASSET_UPDATED',
                });
                return asset;
            },
            setAssetTags: (
                $_,
                { id, assetSourceId, tagIds }: { id: string; assetSourceId: string; tagIds: string[] }
            ) => {
                const asset = assets.find((asset) => asset.id === id && asset.assetSource.id === assetSourceId);
                asset.tags = tags.filter((tag) => tagIds.includes(tag.id));
                addAssetChange({
                    lastModified: asset.lastModified,
                    assetId: id,
                    type: 'ASSET_UPDATED',
                });
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
                asset.collections = assetCollections.filter((collection) =>
                    newAssetCollectionIds.includes(collection.id)
                );
                addAssetChange({
                    lastModified: asset.lastModified,
                    assetId: id,
                    type: 'ASSET_UPDATED',
                });
                return asset;
            },
            deleteTag: ($_, { id }) => {
                tags.splice(
                    tags.findIndex((tag) => tag.id === id),
                    1
                );
                // TODO: Remove tag from assets
                return true;
            },
            deleteAsset: ($_, { id: id, assetSourceId }) => {
                const inUse = Fixtures.getUsageDetailsForAsset(id).reduce(
                    (prev, { usages }) => prev && usages.length > 0,
                    false
                );
                if (inUse) {
                    return false;
                }
                const assetIndex = assets.findIndex(
                    (asset) => asset.id === id && asset.assetSource.id === assetSourceId
                );
                if (assetIndex >= 0) {
                    assets.splice(assetIndex, 1);
                    addAssetChange({
                        lastModified: new Date(),
                        assetId: id,
                        type: 'ASSET_REMOVED',
                    });
                    return true;
                }
                return false;
            },
            createTag: ($_, { tag: newTag }: { tag }) => {
                if (!tags.find((tag) => tag === newTag)) {
                    tags.push(newTag);
                    return newTag;
                }
                return null;
            },
        },
    };

    const graphqlSchema = fs.readFileSync(path.resolve(__dirname, '../../../GraphQL/schema.root.graphql'));

    const typeDefs = gql`
        ${graphqlSchema}
    `;

    const server = new ApolloServer({ typeDefs, resolvers, uploads: false });
    const app = express();

    server.applyMiddleware({ app, path: '/graphql' });

    app.use((req, res, next) => {
        if (req.query.reset) {
            const fixtures = Fixtures.loadFixtures();
            assets = fixtures.assets;
            assetCollections = fixtures.assetCollections;
            tags = fixtures.tags;
            assetSources = fixtures.assetSources;
            console.log('Fixtures have been reset');
        }
        next();
    });
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(bundler.middleware());

    app.listen(PORT, () => {
        console.info(
            `Media Module dev server running at http://localhost:${PORT} and GraphQL at http://localhost:${PORT}${server.graphqlPath}`
        );
    });
})();
