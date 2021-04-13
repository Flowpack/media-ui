import { useMutation, useQuery } from '@apollo/client';

import { AssetIdentity } from '@media-ui/core/src/interfaces';

import { ADD_OR_REMOVE_FROM_CLIPBOARD, CLIPBOARD } from '../queries/ClipboardQuery';

export default function useClipboard() {
    const {
        data: { clipboard },
    } = useQuery<{ clipboard: AssetIdentity[] }>(CLIPBOARD);

    const [mutateClipboard] = useMutation<void, AssetIdentity>(ADD_OR_REMOVE_FROM_CLIPBOARD);

    const addOrRemoveFromClipboard = (assetIdentity: AssetIdentity) =>
        mutateClipboard({
            variables: { ...assetIdentity },
        });

    return { clipboard: clipboard ?? [], addOrRemoveFromClipboard };
}
