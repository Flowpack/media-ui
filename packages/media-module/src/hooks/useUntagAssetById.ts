import { useMutation } from '@apollo/client';

import { UNTAG_ASSET } from '@media-ui/core/src/mutations';

interface UntagAssetByIdProps {
    asset: { id: string; assetSource: { id: string } };
    tagId: string;
}

interface UntagAssetByIdVariables {
    id: string;
    assetSourceId: string;
    tagId: string;
}

export default function useUntagAssetById() {
    const [action, { error, data, loading }] = useMutation<
        { __typename: string; untagAsset: Asset },
        UntagAssetByIdVariables
    >(UNTAG_ASSET);

    const untagAssetById = ({ asset, tagId }: UntagAssetByIdProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                tagId,
            },
        });

    return { untagAssetById, data, error, loading };
}
