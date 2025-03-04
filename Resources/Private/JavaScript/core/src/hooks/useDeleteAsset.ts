import { useMutation } from '@apollo/client';
import { useSetRecoilState } from 'recoil';

import { DELETE_ASSET } from '../mutations';
import { selectedAssetIdState } from '../state';
import { ASSET } from '../queries';
import { useEvent } from './index';
import { assetRemovedEvent } from '../events';

interface DeleteAssetVariables {
    id: string;
    assetSourceId: string;
}

export default function useDeleteAsset() {
    const [action, { error, data }] = useMutation<{ deleteAsset: MutationResult }, DeleteAssetVariables>(DELETE_ASSET);
    const setSelectedAsset = useSetRecoilState(selectedAssetIdState);
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
                'ASSET_COLLECTIONS',
            ],
            update: (cache, { data: { deleteAsset: success } }) => {
                if (!success) return;

                // Remove deleted asset from cache
                cache.evict({ id: cache.identify({ __typename: 'Asset', id: assetId }) });
                cache.gc();
            },
        }).then(({ data: { deleteAsset } }) => {
            if (!deleteAsset.success) {
                throw new Error(deleteAsset.messages.join(', '));
            }

            assetRemoved({ assetId, assetSourceId });

            // Unselect currently selected asset if it was just deleted
            setSelectedAsset((prev) => (prev?.assetId === assetId ? null : prev));
        });

    return { deleteAsset, data, error };
}
