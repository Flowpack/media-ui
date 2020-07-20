import { useMutation } from '@apollo/react-hooks';

import { Asset } from '../interfaces';
import { SET_ASSET_COLLECTIONS } from '../queries';

interface SetAssetCollectionsProps {
    asset: Asset;
    collectionNames: string[];
}

interface SetAssetCollectionsVariables {
    id: string;
    assetSourceId: string;
    assetCollections: string[];
}

export default function useSetAssetCollections() {
    const [action, { error, data, loading }] = useMutation<
        { __typename: string; setAssetCollections: Asset },
        SetAssetCollectionsVariables
    >(SET_ASSET_COLLECTIONS);

    const setAssetCollections = ({ asset, collectionNames }: SetAssetCollectionsProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                assetCollections: collectionNames
            },
            optimisticResponse: {
                __typename: 'Mutation',
                setAssetCollections: {
                    ...asset,
                    collections: collectionNames.map(title => ({
                        __typename: 'AssetCollection',
                        title,
                        tags: []
                    }))
                }
            }
        });

    return { setAssetCollections: setAssetCollections, data, error, loading };
}
