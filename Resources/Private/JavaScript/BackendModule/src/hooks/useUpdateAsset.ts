import { useMutation } from '@apollo/client';

import { UPDATE_ASSET } from '../queries';
import { Asset } from '../interfaces';

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
    const [action, { error, data, loading }] = useMutation<
        { __typename: string; updateAsset: Asset },
        UpdateAssetVariables
    >(UPDATE_ASSET);

    const updateAsset = ({ asset, label, caption, copyrightNotice }: UpdateAssetProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                label,
                caption,
                copyrightNotice,
            },
            optimisticResponse: {
                __typename: 'Mutation',
                updateAsset: {
                    ...asset,
                    label,
                    caption,
                    copyrightNotice,
                },
            },
        });

    return { updateAsset, data, error, loading };
}
