import { useMutation } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { DELETE_ASSET } from '../queries';
import { AssetIdentity } from '../interfaces';
import { selectedAssetIdState } from '../state';
import { useClipboard } from './index';

interface DeleteAssetVariables {
    id: string;
    assetSourceId: string;
}

export default function useDeleteAsset() {
    const [action, { error, data }] = useMutation<{ deleteAsset: boolean }, DeleteAssetVariables>(DELETE_ASSET);
    // TODO: Use variable instead of just deleting the currently selected asset
    const [selectedAssetId, setSelectedAsset] = useRecoilState(selectedAssetIdState);
    const { clipboard, addOrRemoveFromClipboard } = useClipboard();

    // TODO: Check whether an optimisticResponse can be used here
    // Without a fast asset usage count retrieval a lot of negative responses are possible
    const deleteAsset = ({ assetId, assetSourceId }: AssetIdentity) =>
        action({ variables: { id: assetId, assetSourceId: assetSourceId } }).then(() => {
            // Unselect currently selected asset if it was just deleted
            if (assetId === selectedAssetId?.assetId) {
                setSelectedAsset(null);
            }
            // Remove asset from clipboard
            if (clipboard.some((assetIdentity) => assetIdentity.assetId === assetId)) {
                addOrRemoveFromClipboard({ assetId, assetSourceId });
            }
        });

    return { deleteAsset, data, error };
}
