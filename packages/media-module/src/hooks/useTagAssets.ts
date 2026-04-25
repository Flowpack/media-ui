import { useMutation } from '@apollo/client';

import { TAG_ASSETS } from '@media-ui/core/src/mutations';

interface TagAssetsVariables {
    identities: { assetId: string; assetSourceId: string }[];
    tagId: string;
}

export default function useTagAssets() {
    const [action, { error, data, loading }] = useMutation<{ tagAssets: MutationResult[] }, TagAssetsVariables>(
        TAG_ASSETS
    );

    const tagAssets = (identities: AssetIdentity[], tagId: string) =>
        action({
            variables: {
                identities: identities.map(({ assetId, assetSourceId }) => ({ assetId, assetSourceId })),
                tagId,
            },
            refetchQueries: ['ASSETS'],
        }).then(({ data }) => data.tagAssets);

    return { tagAssets, data, error, loading };
}
