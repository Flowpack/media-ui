import { useMutation, useQuery } from '@apollo/client';

import { CLIPBOARD, ADD_OR_REMOVE_FROM_CLIPBOARD } from '../queries';
import { AssetIdentity } from '../interfaces';

export default function useClipboard() {
    const clipboardQuery = useQuery(CLIPBOARD);
    const { clipboard }: { clipboard: AssetIdentity[] } = clipboardQuery.data;
    const [mutateClipboard] = useMutation(ADD_OR_REMOVE_FROM_CLIPBOARD);
    const addOrRemoveFromClipboard = (assetIdentity: AssetIdentity) =>
        mutateClipboard({
            variables: { ...assetIdentity },
        });
    return { clipboard, addOrRemoveFromClipboard };
}
