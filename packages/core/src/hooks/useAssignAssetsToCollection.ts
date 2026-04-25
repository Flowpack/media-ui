import { useMutation } from '@apollo/client';

import { ASSIGN_ASSETS_TO_COLLECTION } from '../mutations';

interface AssignAssetsToCollectionVariables {
    identities: { assetId: string; assetSourceId: string }[];
    assetCollectionId: string;
}

export default function useAssignAssetsToCollection() {
    const [action, { error, data, loading }] = useMutation<
        { assignAssetsToCollection: MutationResult[] },
        AssignAssetsToCollectionVariables
    >(ASSIGN_ASSETS_TO_COLLECTION);

    const assignAssetsToCollection = (identities: AssetIdentity[], assetCollectionId: string) =>
        action({
            variables: {
                identities: identities.map(({ assetId, assetSourceId }) => ({ assetId, assetSourceId })),
                assetCollectionId,
            },
            refetchQueries: ['ASSETS', 'ASSET_COLLECTIONS'],
        }).then(({ data }) => data.assignAssetsToCollection);

    return { assignAssetsToCollection, data, error, loading };
}
