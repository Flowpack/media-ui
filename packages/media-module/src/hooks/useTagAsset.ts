import { useMutation } from '@apollo/client';

import { TAG_ASSET } from '@media-ui/core/src/mutations';

interface TagAssetProps {
    asset: { id: string; assetSource: { id: string } };
    tagId: string;
}

interface TagAssetVariables {
    id: string;
    assetSourceId: string;
    tagId: string;
}

export default function useTagAsset() {
    const [action, { error, data, loading }] = useMutation<{ tagAsset: MutationResult }, TagAssetVariables>(TAG_ASSET);

    const tagAsset = ({ asset, tagId }: TagAssetProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                tagId,
            },
            refetchQueries: ['ASSETS'],
        });

    return { tagAsset, data, error, loading };
}
