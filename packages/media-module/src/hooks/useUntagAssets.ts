import { useMutation } from '@apollo/client';

import { UNTAG_ASSETS } from '@media-ui/core/src/mutations';

interface UntagAssetsVariables {
    identities: { assetId: string; assetSourceId: string }[];
    tagId: string;
}

export default function useUntagAssets() {
    const [action, { error, data, loading }] = useMutation<{ untagAssets: MutationResult[] }, UntagAssetsVariables>(
        UNTAG_ASSETS
    );

    const untagAssets = (identities: AssetIdentity[], tagId: string) =>
        action({
            variables: {
                identities: identities.map(({ assetId, assetSourceId }) => ({ assetId, assetSourceId })),
                tagId,
            },
            refetchQueries: ['ASSETS'],
        }).then(({ data }) => data.untagAssets);

    return { untagAssets, data, error, loading };
}
