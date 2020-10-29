import { useMutation } from '@apollo/react-hooks';

import { Asset, AssetCollection } from '../interfaces';
import { SET_ASSET_COLLECTIONS } from '../queries';

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
    const [action, { error, data, loading }] = useMutation<
        { __typename: string; setAssetCollections: Asset },
        SetAssetCollectionsVariables
    >(SET_ASSET_COLLECTIONS);

    const setAssetCollections = ({ asset, assetCollections }: SetAssetCollectionsProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                assetCollectionIds: assetCollections.map(c => c.id)
            },
            optimisticResponse: {
                __typename: 'Mutation',
                setAssetCollections: {
                    ...asset,
                    collections: assetCollections
                }
            }
        });

    return { setAssetCollections: setAssetCollections, data, error, loading };
}
