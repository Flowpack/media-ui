import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { gql } from '@apollo/client';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import esbuild from 'esbuild';

import * as Fixtures from './fixtures/index';

// FIXME: type annotations are missing as they couldn't be included anymore while making the devserver work again
// import { AssetChange, AssetChangeQueryResult, AssetChangeType } from '@media-ui/feature-concurrent-editing/src';
interface MutationResult {
    success: boolean;
    messages: string[];
    data?: any[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
    const frontendPort = 8000;

    const options: esbuild.BuildOptions = {
        logLevel: 'info',
        bundle: true,
        minify: false,
        keepNames: true,
        sourcemap: 'linked',
        mainFields: ['browser', 'module', 'main'],
        target: 'es2020',
        entryPoints: {
            server: path.resolve(__dirname, './index.ts'),
            main: '@media-ui/media-module/src/index',
        },
        alias: {
            // Yarn installs two physically distinct @apollo/client copies: the one used by
            // @media-ui/media-module is peer-satisfied with graphql@15, while the root-hoisted
            // copy used by @media-ui/core and the feature packages peers against graphql@16.
            // Bundling both breaks Apollo's React context (ApolloProvider and the query hooks
            // come from different module instances), so pin the whole bundle to a single
            // self-consistent @apollo/client + graphql@15 pair.
            '@apollo/client': path.resolve(__dirname, '../../media-module/node_modules/@apollo/client'),
            graphql: path.resolve(__dirname, '../../media-module/node_modules/graphql'),
        },
        outdir: path.resolve(__dirname, '../public/dist'),
        define: {
            // react-image-lightbox
            global: 'window',
        },
    };

    esbuild.context(options).then((ctx) => ctx.watch());

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

    const sortAssets = (assets: Asset[], sortBy: string, sortDirection: string) => {
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
                defaultAssetCollectionId: null,
                canManageAssetCollections: true,
                canManageTags: true,
                canManageAssets: true,
                supportsMetadataEditing: false,
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
            setAssetCollectionParent: (
                $_,
                { id, assetSourceId, parent }: { id: string; assetSourceId: string; parent: string }
            ): MutationResult => {
                const assetCollection = assetCollections.find((assetCollection) => assetCollection.id === id);
                const parentCollection = assetCollections.find((assetCollection) => assetCollection.id === parent);
                if (!assetCollection || !parentCollection)
                    return { success: false, messages: ['Collection not found'] };

                // Check if there would be a recursion
                let tmpParent = parentCollection;
                while (tmpParent?.parent) {
                    // @ts-ignore
                    tmpParent = assetCollections.find((assetCollection) => assetCollection.id === tmpParent.parent.id);
                    if (tmpParent.id === parentCollection.id) {
                        return { success: false, messages: ['Recursion detected'] };
                    }
                }

                assetCollection.parent = {
                    __typename: 'AssetCollectionParent',
                    id: parentCollection.id,
                    assetSourceId: parentCollection.assetSourceId,
                    title: parentCollection.title,
                };
                return { success: true, messages: [] };
            },
            updateAssetCollection: (
                $_,
                { id, title, tagIds }: { id: string; title: string; tagIds: string[] }
            ): MutationResult => {
                const assetCollection = assetCollections.find((assetCollection) => assetCollection.id === id);
                if (!assetCollection) return { success: false, messages: ['Asset collection not found'] };
                if (title) {
                    // @ts-ignore we intentionally overwrite the readonly property here
                    assetCollection.title = title;
                }
                if (Array.isArray(tagIds)) {
                    assetCollection.tags = tags.filter((tag) => tagIds.includes(tag.id));
                }
                return { success: true, messages: [] };
            },
            deleteAssetCollection: ($_, { id }: { id: string }): MutationResult => {
                const assetCollection = assetCollections.find((assetCollection) => assetCollection.id === id);
                if (!assetCollection) return { success: false, messages: ['Asset collection not found'] };
                if (assetCollection.assetCount > 0) return { success: false, messages: ['Asset collection not empty'] };
                assetCollections = assetCollections.filter((assetCollection) => assetCollection.id !== id);
                return { success: true, messages: [] };
            },
            createAssetCollection: ($_, { title, parent }: { title: string; parent: string }): AssetCollection => {
                const parentCollection = parent
                    ? assetCollections.find((assetCollection) => assetCollection.id === parent)
                    : null;
                const newCollection: AssetCollection = {
                    __typename: 'AssetCollection',
                    id: `someId_${Date.now()}`,
                    assetSourceId: 'neos',
                    title,
                    parent: parentCollection
                        ? {
                              __typename: 'AssetCollectionParent',
                              id: parentCollection.id,
                              assetSourceId: 'neos',
                              title: parentCollection.title,
                          }
                        : null,
                    tags: [],
                    assetCount: 0,
                    canDelete: true,
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
                return { success: true, messages: [] };
            },
            deleteTag: ($_, { id }): MutationResult => {
                const index = tags.findIndex((tag) => tag.id === id);
                if (index === -1) return { success: false, messages: ['Tag not found'] };
                tags.splice(index, 1);
                // Remove tag from assets
                assets.forEach((asset) => {
                    asset.tags = asset.tags.filter((tag) => tag.id !== id);
                });
                return { success: true, messages: [] };
            },
            deleteAsset: ($_, { id: id, assetSourceId }) => {
                const inUse = Fixtures.getUsageDetailsForAsset(id).reduce(
                    (prev, { usages }) => prev || usages.length > 0,
                    false
                );
                if (inUse) {
                    return { success: false, messages: ['Asset is in use'] };
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
                    return { success: true, messages: [] };
                }
                return { success: false, messages: ['Asset not found'] };
            },
            createTag: (
                $_,
                {
                    label,
                    assetSourceId,
                    assetCollectionId,
                }: { label: string; assetSourceId: string; assetCollectionId?: string }
            ): Tag => {
                const newTag: Tag = {
                    __typename: 'Tag',
                    id: `index ${tags.length + 1}`,
                    label,
                    assetSourceId,
                };
                if (tags.find((tag) => tag === newTag)) {
                    throw new Error('Tag with this id already exists');
                }
                if (assetCollectionId) {
                    const assetCollection: AssetCollection | undefined = assetCollections.find(
                        (collection) => collection.id === assetCollectionId
                    );
                    assetCollection?.tags?.push(newTag);
                }
                tags.push(newTag);
                return newTag;
            },
            updateTag: ($_, { id, assetSourceId, label }): Tag => {
                const tag = tags.find((tag) => tag.id === id && tag.assetSourceId === assetSourceId);
                if (!tag) throw new Error('Tag not found');
                // @ts-ignore we intentionally overwrite the readonly property here
                tag.label = label;
                return tag;
            },
            replaceAsset: ($_, { id, assetSourceId, file, options }): FileUploadResult => {
                throw new Error('Not implemented');
            },
            editAsset: ($_, { id, assetSourceId, filename, options }): boolean => {
                throw new Error('Not implemented');
            },
            tagAsset: ($_, { id, assetSourceId, tagId }): Asset => {
                const asset = assets.find((asset) => asset.id === id && asset.assetSource.id === assetSourceId);
                const tag = tags.find((tag) => tag.id === tagId);
                if (!asset) {
                    throw new Error('Asset not found');
                }
                if (!tag) {
                    throw new Error('Tag not found');
                }
                if (!asset.tags.find((tag) => tag.id === tagId)) {
                    asset.tags = [...asset.tags, tag];
                    addAssetChange({
                        lastModified: asset.lastModified,
                        assetId: id,
                        type: 'ASSET_UPDATED',
                    });
                }
                return asset;
            },
            untagAsset: ($_, { id, assetSourceId, tagId }): Asset => {
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

    const graphqlSchema = fs.readFileSync(
        path.resolve(__dirname, '../../../Resources/Private/GraphQL/schema.root.graphql')
    );

    const typeDefs = gql`
        ${graphqlSchema}
    `;

    const server = new ApolloServer({ typeDefs, resolvers });
    const app = express();

    await server.start();

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

    app.listen(frontendPort, () => {
        console.info(
            `Media Module dev server running at http://localhost:${frontendPort} and GraphQL at http://localhost:${frontendPort}${server.graphqlPath}`
        );
    });
})();
