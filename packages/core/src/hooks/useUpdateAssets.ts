import { useMutation } from '@apollo/client';

import { UPDATE_ASSETS } from '../mutations';

interface UpdateAssetsVariables {
    identities: { assetId: string; assetSourceId: string }[];
    copyrightNotice?: string;
}

export default function useUpdateAssets() {
    const [action, { error, data, loading }] = useMutation<{ updateAssets: MutationResult[] }, UpdateAssetsVariables>(
        UPDATE_ASSETS
    );

    const updateAssets = (identities: AssetIdentity[], copyrightNotice: string) =>
        action({
            variables: {
                identities: identities.map(({ assetId, assetSourceId }) => ({ assetId, assetSourceId })),
                copyrightNotice,
            },
            refetchQueries: ['ASSETS'],
        }).then(({ data }) => data.updateAssets);

    return { updateAssets, data, error, loading };
}
