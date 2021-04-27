import { useCallback } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

import { AssetIdentity } from '@media-ui/core/src/interfaces';

import { ADD_OR_REMOVE_FROM_CLIPBOARD, CLIPBOARD } from '../queries/ClipboardQuery';

export type ClipboardItems = Record<string, AssetIdentity>;

export default function useClipboard() {
    const {
        data: { clipboard },
    } = useQuery<{ clipboard: ClipboardItems }>(CLIPBOARD);

    const [mutateClipboard] = useMutation<void, AssetIdentity>(ADD_OR_REMOVE_FROM_CLIPBOARD);

    const inClipboard = useCallback(
        ({ assetId }: AssetIdentity) => {
            return {}.hasOwnProperty.call(clipboard, assetId) as boolean;
        },
        [clipboard]
    );

    const addOrRemoveFromClipboard = useCallback(
        (assetIdentity: AssetIdentity) =>
            mutateClipboard({
                variables: { ...assetIdentity },
                update: (cache) => {
                    const { clipboard: cachedClipboard }: { clipboard: ClipboardItems } = cache.readQuery({
                        query: CLIPBOARD,
                    });
                    cache.writeFragment({
                        id: cache.identify({ __typename: 'Asset', id: assetIdentity.assetId }),
                        fragment: gql`
                            fragment UpdatedAsset on Asset {
                                isInClipboard
                            }
                        `,
                        data: {
                            isInClipboard: {}.hasOwnProperty.call(cachedClipboard, assetIdentity.assetId) as boolean,
                        },
                    });
                },
            }),
        [mutateClipboard]
    );

    return { clipboard: clipboard ?? {}, inClipboard, addOrRemoveFromClipboard };
}
