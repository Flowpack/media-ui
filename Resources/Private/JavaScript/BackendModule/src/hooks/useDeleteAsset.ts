import { useMutation } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { DELETE_ASSET } from '../queries';
import { Asset } from '../interfaces';
import { selectedAssetIdState } from '../state';

interface DeleteAssetVariables {
    id: string;
    assetSourceId: string;
}

export default function useDeleteAsset() {
    const [action, { error, data }] = useMutation<{ deleteAsset: boolean }, DeleteAssetVariables>(DELETE_ASSET);
    // TODO: Use variable instead of just deleting the currently selected asset
    const [selectedAssetId, setSelectedAsset] = useRecoilState(selectedAssetIdState);

    // TODO: Check whether an optimisticResponse can be used here
    // Without a fast asset usage count retrieval a lot of negative responses are possible
    const deleteAsset = ({ id, assetSource: { id: assetSourceId } }: Asset) =>
        action({ variables: { id, assetSourceId } }).then(() => {
            // Unselect currently selected asset if it was just deleted
            if (id === selectedAssetId.assetId) {
                setSelectedAsset(null);
            }
        });

    return { deleteAsset, data, error };
}
