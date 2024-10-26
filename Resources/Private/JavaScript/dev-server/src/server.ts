import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Parcel } from '@parcel/core';
import { gql } from '@apollo/client';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import * as Fixtures from './fixtures/index';

// FIXME: type annotations are missing as they couldn't be included anymore while making the devserver work again
// import { AssetChange, AssetChangeQueryResult, AssetChangeType } from '@media-ui/feature-concurrent-editing/src';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
    const bundlerPort = 8001;
    const frontendPort = 8000;

    const bundler = new Parcel({
        defaultConfig: '@parcel/config-default',
        entries: path.resolve(__dirname, './index.html'),
        defaultTargetOptions: {
            distDir: path.resolve(__dirname, '../dist'),
            publicUrl: '/',
        },
        mode: 'development',
        // cache: false,
        logLevel: 'info',
        serveOptions: {
            publicUrl: '/',
            port: bundlerPort,
            host: 'localhost',
        },
        hmrOptions: {
            port: bundlerPort,
            host: 'localhost',
        },
    });
    bundler.watch();

    let { assets, assetCollections, assetSources, tags } = Fixtures.loadFixtures();

    const filterAssets = (
        assetSourceId = '',
        tagId = '',
        assetCollectionId = '',
        mediaType = '',
        searchTerm = '',
        assetType = null
    ) => {
        return assets.filter((asset) => {
            return (
                (!assetSourceId || asset.assetSource.id === assetSourceId) &&
                (!tagId || asset.tags.find(({ id }) => id === tagId)) &&
                (!assetCollectionId || asset.collections.find(({ id }) => id === assetCollectionId)) &&
                (!searchTerm || asset.label.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) &&
                (!mediaType || mediaType === 'all' || asset.file.mediaType.indexOf(mediaType) >= 0) &&
                (!assetType || assetType === asset.type)
            );
        });
    };

    const sortAssets = (assets: Asset[], sortBy, sortDirection) => {
        const sorted = assets.sort((a, b) => {
            if (sortBy === 'name') {
                // Using the label here since teh filename is the same in every fixture
                return a.label.localeCompare(b.label);
            }
            return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
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
                    assetType = null,
                }
            ): Asset[] =>
                sortAssets(
                    filterAssets(assetSourceId, tagId, assetCollectionId, mediaType, searchTerm, assetType).slice(
                        offset,
                        offset + limit
                    ),
                    sortBy,
                    sortDirection
                ),
            unusedAssets: ($_, { limit = 20, offset = 0 }): Asset[] =>
                assets.filter(({ isInUse }) => !isInUse).slice(offset, offset + limit),
            unusedAssetCount: (): number => assets.filter(({ isInUse }) => !isInUse).length,
            changedAssets: ($_, { since }) => {
                const { lastModified, changes } = changedAssetsResponse.changedAssets;
                since = since ? new Date(since) : null;

                return {
                    lastModified,
                    changes: since ? changes.filter((change) => change.lastModified > since) : changes,
                };
            },
            similarAssets: ($_, { id, assetSourceId }) => {
                throw new Error('Not implemented');
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            assetCount: (
                $_,
                {
                    assetSourceId = 'neos',
                    tagId = null,
                    assetCollectionId = null,
                    mediaType = '',
                    searchTerm = '',
                    assetType = null,
                }
            ): number => {
                return filterAssets(assetSourceId, tagId, assetCollectionId, mediaType, searchTerm, assetType).length;
            },
            assetUsageDetails: ($_, { id }): UsageDetailsGroup[] => {
                return Fixtures.getUsageDetailsForAsset(id);
            },
            assetUsageCount: ($_, { id, assetSourceId }): number => {
                throw new Error('Not implemented');
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            assetVariants: ($_, { id }): AssetVariant[] => {
                // TODO: Implement assetVariants
                return [];
            },
            assetSources: (): AssetSource[] => assetSources,
            assetCollections: (): AssetCollection[] => assetCollections,
            assetCollection: ($_, { id }): AssetCollection =>
                assetCollections.find((assetCollection) => assetCollection.id === id),
            tags: (): Tag[] => tags,
            tag: ($_, { id }): Tag => tags.find((tag) => tag.id === id),
            config: () => ({
                uploadMaxFileSize: 1024 * 1024,
                uploadMaxFileUploadLimit: 2,
                currentServerTime: new Date(),
                canManageAssetCollections: true,
                canManageTags: true,
                canManageAssets: true,
            }),
        },
        Mutation: {
            updateAsset: ($_, { id, assetSourceId, label, caption, copyrightNotice }): Asset => {
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
            setAssetCollectionParent: ($_, { id, parent }: { id: string; parent: string }): boolean => {
                const assetCollection = assetCollections.find((assetCollection) => assetCollection.id === id);
                const parentCollection = assetCollections.find((assetCollection) => assetCollection.id === parent);
                if (!assetCollection || !parentCollection) return false;

                // Check if there would be a recursion
                let tmpParent = parentCollection;
                while (tmpParent) {
                    tmpParent = tmpParent.parent as AssetCollection;
                    if (tmpParent.id === parentCollection.id) {
                        return false;
                    }
                }

                assetCollection.parent = parentCollection;
                return true;
            },
            updateAssetCollection: (
                $_,
                { id, title, tagIds }: { id: string; title: string; tagIds: string[] }
            ): boolean => {
                const assetCollection = assetCollections.find((assetCollection) => assetCollection.id === id);
                if (title) {
                    // @ts-ignore we intentionally overwrite the readonly property here
                    assetCollection.title = title;
                }
                if (Array.isArray(tagIds)) {
                    assetCollection.tags = tags.filter((tag) => tagIds.includes(tag.id));
                }
                return true;
            },
            deleteAssetCollection: ($_, { id }: { id: string }): boolean => {
                const assetCollection = assetCollections.find((assetCollection) => assetCollection.id === id);
                if (!assetCollection) return false;
                assetCollections = assetCollections.filter((assetCollection) => assetCollection.id !== id);
                return true;
            },
            createAssetCollection: ($_, { title, parent }: { title: string; parent: string }): AssetCollection => {
                const parentCollection = parent
                    ? assetCollections.find((assetCollection) => assetCollection.id === parent)
                    : null;
                const newCollection: AssetCollection = {
                    __typename: 'AssetCollection',
                    id: `someId_${Date.now()}`,
                    title,
                    parent: parentCollection
                        ? {
                              id: parentCollection.id,
                              title: parentCollection.title,
                          }
                        : null,
                    tags: [],
                    assetCount: 0,
                };
                assetCollections.push(newCollection);
                return newCollection;
            },
            setAssetTags: (
                $_,
                { id, assetSourceId, tagIds }: { id: string; assetSourceId: string; tagIds: string[] }
            ): Asset => {
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
            ): boolean => {
                const asset = assets.find((asset) => asset.id === id && asset.assetSource.id === assetSourceId);
                asset.collections = assetCollections.filter((collection) =>
                    newAssetCollectionIds.includes(collection.id)
                );
                addAssetChange({
                    lastModified: asset.lastModified,
                    assetId: id,
                    type: 'ASSET_UPDATED',
                });
                return true;
            },
            deleteTag: ($_, { id }): boolean => {
                tags.splice(
                    tags.findIndex((tag) => tag.id === id),
                    1
                );
                // Remove tag from assets
                assets.forEach((asset) => {
                    asset.tags = asset.tags.filter((tag) => tag.id !== id);
                });
                return true;
            },
            deleteAsset: ($_, { id: id, assetSourceId }): boolean => {
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
            createTag: ($_, { tag: newTag }: { tag: Tag }): Tag => {
                if (!tags.find((tag) => tag === newTag)) {
                    tags.push(newTag);
                    return newTag;
                }
                return null;
            },
            updateTag: ($_, { id, label }): Tag => {
                throw new Error('Not implemented');
            },
            replaceAsset: ($_, { id, assetSourceId, file, options }): FileUploadResult => {
                throw new Error('Not implemented');
            },
            editAsset: ($_, { id, assetSourceId, filename, options }): boolean => {
                throw new Error('Not implemented');
            },
            tagAsset: ($_, { id, assetSourceId, tagId }): Asset => {
                throw new Error('Not implemented');
            },
            untagAsset: ($_, { id, assetSourceId, tagId }): Asset => {
                throw new Error('Not implemented');
            },
            uploadFile: ($_, { file, tagId, assetCollectionId }): FileUploadResult => {
                throw new Error('Not implemented');
            },
            uploadFiles: ($_, { files, tagId, assetCollectionId }): FileUploadResult[] => {
                throw new Error('Not implemented');
            },
            importAsset: ($_, { id, assetSourceId }): Asset => {
                throw new Error('Not implemented');
            },
        },
    };

    const graphqlSchema = fs.readFileSync(path.resolve(__dirname, '../../../GraphQL/schema.root.graphql'));

    const typeDefs = gql`
        ${graphqlSchema}
    `;

    const server = new ApolloServer({ typeDefs, resolvers, uploads: false });
    const app = express();

    // @ts-ignore
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

    const parcelMiddleware = createProxyMiddleware({
        target: `http://localhost:${bundlerPort}`,
    });
    app.use('/', parcelMiddleware);

    app.listen(frontendPort, () => {
        console.info(
            `Media Module dev server running at http://localhost:${frontendPort} and GraphQL at http://localhost:${frontendPort}${server.graphqlPath}`
        );
    });
})();
