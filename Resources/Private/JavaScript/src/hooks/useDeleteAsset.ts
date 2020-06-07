import { useMutation } from '@apollo/react-hooks';

import { DELETE_ASSET } from '../queries';
import { Asset } from '../interfaces';

interface DeleteAssetVariables {
    id: string;
    assetSource: string;
}

export default function useDeleteAsset() {
    const [action, { error, data }] = useMutation<{ deleteAsset: boolean }, DeleteAssetVariables>(DELETE_ASSET);

    // TODO: Check whether an optimisticResponse can be used here
    // Without a fast asset usage count retrieval a lot of negative responses are possible
    const deleteAsset = ({ id, assetSource: { id: assetSource } }: Asset) => action({ variables: { id, assetSource } });

    return { deleteAsset, data, error };
}
