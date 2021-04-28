import { useMutation } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { DELETE_ASSET } from '../mutations';
import { AssetIdentity } from '../interfaces';
import { selectedAssetIdState } from '../state';
import { ASSET } from '../queries';
import { useEvent } from './index';
import { assetRemovedEvent } from '../events';

interface DeleteAssetVariables {
    id: string;
    assetSourceId: string;
}

export default function useDeleteAsset() {
    const [action, { error, data }] = useMutation<{ deleteAsset: boolean }, DeleteAssetVariables>(DELETE_ASSET);
    const [selectedAssetId, setSelectedAsset] = useRecoilState(selectedAssetIdState);
    const assetRemoved = useEvent(assetRemovedEvent);

    // TODO: Check whether an optimisticResponse can be used here
    // Without a fast asset usage count retrieval a lot of negative responses are possible
    const deleteAsset = ({ assetId, assetSourceId }: AssetIdentity) =>
        action({
            variables: { id: assetId, assetSourceId: assetSourceId },
            refetchQueries: [
                {
                    query: ASSET,
                    variables: { id: assetId, assetSourceId: assetSourceId },
                },
            ],
            update: (cache, { data: { deleteAsset: success } }) => {
                if (!success) return;

                // Remove deleted asset from cache
                cache.evict({ id: cache.identify({ __typename: 'Asset', id: assetId }) });
                cache.gc();
            },
        }).then(({ data: { deleteAsset: success } }) => {
            if (!success) {
                throw new Error('Could not delete asset');
            }

            assetRemoved({ assetId, assetSourceId });

            // Unselect currently selected asset if it was just deleted
            if (assetId === selectedAssetId?.assetId) {
                setSelectedAsset(null);
            }
        });

    return { deleteAsset, data, error };
}
