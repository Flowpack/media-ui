import { useMutation } from '@apollo/react-hooks';

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
    assetSource: string;
    label?: string;
    caption?: string;
    copyrightNotice?: string;
}

export default function useUpdateAsset() {
    const [action, { error, data, loading }] = useMutation<{ updateAsset: Asset }, UpdateAssetVariables>(UPDATE_ASSET);

    const updateAsset = ({ asset, label, caption, copyrightNotice }: UpdateAssetProps) =>
        action({
            variables: {
                id: asset.id,
                assetSource: asset.assetSource.id,
                label,
                caption,
                copyrightNotice
            },
            optimisticResponse: {
                updateAsset: {
                    ...asset,
                    label,
                    caption,
                    copyrightNotice
                }
            }
        });

    return { updateAsset, data, error, loading };
}
