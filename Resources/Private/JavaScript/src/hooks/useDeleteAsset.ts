import { useMutation } from '@apollo/react-hooks';
import { useRecoilState } from 'recoil';

import { DELETE_ASSET } from '../queries';
import { Asset } from '../interfaces';
import { selectedAssetState } from '../state';

interface DeleteAssetVariables {
    id: string;
    assetSourceId: string;
}

export default function useDeleteAsset() {
    const [action, { error, data }] = useMutation<{ deleteAsset: boolean }, DeleteAssetVariables>(DELETE_ASSET);
    const [selectedAsset, setSelectedAsset] = useRecoilState(selectedAssetState);

    // TODO: Check whether an optimisticResponse can be used here
    // Without a fast asset usage count retrieval a lot of negative responses are possible
    const deleteAsset = ({ id, assetSource: { id: assetSourceId } }: Asset) =>
        action({ variables: { id, assetSourceId } }).then(() => {
            // Unselect currently selected asset if it was just deleted
            if (id === selectedAsset?.id) {
                setSelectedAsset(null);
            }
        });

    return { deleteAsset, data, error };
}
