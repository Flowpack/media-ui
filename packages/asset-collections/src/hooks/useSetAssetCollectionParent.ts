import { useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { SET_ASSET_COLLECTION_PARENT } from '../mutations/setAssetCollectionParent';

interface SetAssetCollectionParentProps {
    assetCollection: AssetCollection;
    assetSourceId: AssetSourceId;
    parent: AssetCollection | null;
}

interface SetAssetCollectionParentVariables {
    id: AssetCollectionId;
    assetSourceId: AssetSourceId;
    parent?: AssetCollectionId;
}

export function useSetAssetCollectionParent() {
    const [action, { error, data, loading }] = useMutation<
        { setAssetCollectionParent: MutationResult },
        SetAssetCollectionParentVariables
    >(SET_ASSET_COLLECTION_PARENT);

    const setAssetCollectionParent = useCallback(
        ({ assetCollection, assetSourceId, parent }: SetAssetCollectionParentProps) =>
            action({
                variables: {
                    id: assetCollection.id,
                    assetSourceId,
                    parent: parent?.id,
                },
                optimisticResponse: {
                    setAssetCollectionParent: {
                        success: true,
                        messages: [],
                    },
                },
                update: (cache, { data }) => {
                    if (!data) return;
                    cache.modify({
                        id: cache.identify({
                            __typename: 'AssetCollection',
                            id: assetCollection.id,
                        }),
                        broadcast: false,
                        fields: {
                            parent: () =>
                                parent
                                    ? {
                                          __ref: cache.identify({
                                              __typename: 'AssetCollection',
                                              id: parent.id,
                                          }),
                                      }
                                    : null,
                        },
                    });
                },
            }),
        [action]
    );

    return { setAssetCollectionParent, data, error, loading };
}
