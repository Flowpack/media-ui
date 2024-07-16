import { useMutation } from '@apollo/client';

import { SET_ASSET_COLLECTIONS } from '../mutations';

interface SetAssetCollectionsProps {
    asset: Asset;
    assetCollections: AssetCollection[];
}

interface SetAssetCollectionsVariables {
    id: string;
    assetSourceId: string;
    assetCollectionIds: string[];
}

export default function useSetAssetCollections() {
    const [action, { error, data, loading }] = useMutation<boolean, SetAssetCollectionsVariables>(
        SET_ASSET_COLLECTIONS
    );

    const setAssetCollections = ({ asset, assetCollections }: SetAssetCollectionsProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                assetCollectionIds: assetCollections.map((c) => c.id),
            },
            optimisticResponse: true,
            // The ASSETS query should be triggered to again show the full amount of assets in the current collection
            // FIXME: The ASSET_COLLECTIONS query is triggered to update the asset count in the asset collection list, which could be modified directly in the cache update method below
            refetchQueries: ['ASSETS', 'ASSET_COLLECTIONS'],
            update: (cache, { data }) => {
                if (!data) return;
                cache.modify({
                    id: cache.identify({
                        __typename: 'Asset',
                        id: asset.id,
                    }),
                    fields: {
                        collections: () =>
                            assetCollections?.map((collection) => ({
                                __ref: cache.identify({
                                    __typename: 'AssetCollection',
                                    id: collection.id,
                                }),
                            })),
                    },
                });
            },
        });

    return { setAssetCollections: setAssetCollections, data, error, loading };
}
