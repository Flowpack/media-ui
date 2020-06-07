import { useMutation } from '@apollo/react-hooks';

import { UPDATE_ASSET } from '../queries';
import { Asset } from '../interfaces';

interface UpdateAssetProps {
    asset: Asset;
    label?: string;
    caption?: string;
}

interface UpdateAssetVariables {
    id: string;
    assetSource: string;
    label?: string;
    caption?: string;
}

export default function useUpdateAsset() {
    const [action, { error, data }] = useMutation<{ updateAsset: Asset }, UpdateAssetVariables>(UPDATE_ASSET);

    const updateAsset = ({
        asset: {
            id,
            assetSource: { id: assetSource }
        },
        label,
        caption
    }: UpdateAssetProps) =>
        action({
            variables: {
                id,
                assetSource,
                label,
                caption
            }
        });

    return { updateAsset, data, error };
}
