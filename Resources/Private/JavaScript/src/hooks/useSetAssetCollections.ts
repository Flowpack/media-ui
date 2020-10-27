import { useMutation } from '@apollo/react-hooks';

import { Asset, AssetCollection } from '../interfaces';
import { SET_ASSET_COLLECTIONS } from '../queries';

interface SetAssetCollectionsProps {
    asset: Asset;
    collections: AssetCollection[];
}

interface SetAssetCollectionsVariables {
    id: string;
    assetSourceId: string;
    collectionIds: string[];
}

export default function useSetAssetCollections() {
    const [action, { error, data, loading }] = useMutation<
        { setAssetCollections: Asset },
        SetAssetCollectionsVariables
    >(SET_ASSET_COLLECTIONS);

    const setAssetCollections = ({ asset, collections }: SetAssetCollectionsProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                collectionIds: collections.map(c => c.id)
            },
            optimisticResponse: {
                setAssetCollections: {
                    ...asset,
                    collections
                }
            }
        });

    return { setAssetCollections: setAssetCollections, data, error, loading };
}
