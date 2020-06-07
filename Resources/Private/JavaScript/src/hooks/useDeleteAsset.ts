import { useMutation } from '@apollo/react-hooks';

import { DELETE_ASSET } from '../queries';
import { Asset } from '../interfaces';

interface DeleteAssetVariables {
    id: string;
    assetSource: string;
}

export default function useDeleteAsset() {
    const [action, { error, data }] = useMutation<{ deleteAsset: Asset }, DeleteAssetVariables>(DELETE_ASSET);

    const deleteAsset = ({ id, assetSource: { id: assetSource } }: Asset) => action({ variables: { id, assetSource } });

    return { deleteAsset, data, error };
}
