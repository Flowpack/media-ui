import { useMutation } from '@apollo/client';

import { UPDATE_ASSET } from '../mutations';

interface UpdateAssetProps {
    asset: Asset;
    label?: string;
    caption?: string;
    copyrightNotice?: string;
}

interface UpdateAssetVariables {
    id: string;
    assetSourceId: string;
    label?: string;
    caption?: string;
    copyrightNotice?: string;
}

export default function useUpdateAsset() {
    const [action, { error, data, loading }] = useMutation<{ updateAsset: MutationResult }, UpdateAssetVariables>(
        UPDATE_ASSET
    );

    const updateAsset = ({ asset, label, caption, copyrightNotice }: UpdateAssetProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                label,
                caption,
                copyrightNotice,
            },
            refetchQueries: ['ASSETS'],
        }).then(({ data: { updateAsset: result } }) => {
            if (!result.success) {
                throw new Error(result.messages.join(', '));
            }
        });

    return { updateAsset, data, error, loading };
}
