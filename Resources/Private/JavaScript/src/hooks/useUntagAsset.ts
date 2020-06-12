import { useMutation } from '@apollo/react-hooks';

import { Asset } from '../interfaces';
import { UNTAG_ASSET } from '../queries';

interface UntagAssetProps {
    asset: Asset;
    tagName: string;
}

interface UntagAssetVariables {
    id: string;
    assetSourceId: string;
    tag: string;
}

export default function useUntagAsset() {
    const [action, { error, data, loading }] = useMutation<{ untagAsset: Asset }, UntagAssetVariables>(UNTAG_ASSET);

    const untagAsset = ({ asset, tagName }: UntagAssetProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                tag: tagName
            },
            optimisticResponse: {
                untagAsset: {
                    ...asset,
                    tags: [...asset.tags.filter(tag => tag.label !== tagName)]
                }
            }
        });

    return { untagAsset, data, error, loading };
}
