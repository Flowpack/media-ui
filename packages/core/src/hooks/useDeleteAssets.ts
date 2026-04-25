import { useMutation } from '@apollo/client';
import { useSetRecoilState } from 'recoil';

import { DELETE_ASSETS } from '../mutations';
import { selectedAssetIdState } from '../state';
import { useEvent } from './index';
import { assetRemovedEvent } from '../events';

interface DeleteAssetsVariables {
    identities: { assetId: string; assetSourceId: string }[];
}

export default function useDeleteAssets() {
    const [action, { error, data, loading }] = useMutation<{ deleteAssets: MutationResult[] }, DeleteAssetsVariables>(
        DELETE_ASSETS
    );
    const setSelectedAsset = useSetRecoilState(selectedAssetIdState);
    const assetRemoved = useEvent(assetRemovedEvent);

    const deleteAssets = (identities: AssetIdentity[]) =>
        action({
            variables: {
                identities: identities.map(({ assetId, assetSourceId }) => ({ assetId, assetSourceId })),
            },
            refetchQueries: ['ASSET_COLLECTIONS'],
            update: (cache, { data }) => {
                if (!data) return;
                data.deleteAssets.forEach((result, index) => {
                    if (!result.success) return;
                    const { assetId, assetSourceId } = identities[index];
                    cache.evict({ id: cache.identify({ __typename: 'Asset', id: assetId }) });
                    assetRemoved({ assetId, assetSourceId });
                });
                cache.gc();
            },
        }).then(({ data }) => {
            // Unselect if a selected asset was deleted
            setSelectedAsset((prev) => {
                if (!prev) return prev;
                const deletedSuccessfully = identities.filter((_, i) => data.deleteAssets[i].success);
                return deletedSuccessfully.some(({ assetId }) => assetId === prev.assetId) ? null : prev;
            });
            return data.deleteAssets;
        });

    return { deleteAssets, data, error, loading };
}
