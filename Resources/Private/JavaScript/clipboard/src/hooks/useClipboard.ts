import { useCallback, useMemo } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

import { AssetIdentity } from '@media-ui/core/src/interfaces';

import { TOGGLE_CLIPBOARD_STATE, CLIPBOARD } from '../queries/ClipboardQuery';

export type ClipboardItems = Record<string, AssetIdentity>;

export default function useClipboard() {
    const { data } = useQuery<{ clipboard: ClipboardItems }>(CLIPBOARD);
    const clipboard = useMemo(() => data?.clipboard ?? {}, [data]);

    const [mutateClipboard] = useMutation<void, { assetId: string; assetSourceId: string; force: boolean }>(
        TOGGLE_CLIPBOARD_STATE
    );

    const inClipboard = useCallback(
        ({ assetId }: AssetIdentity) => {
            return {}.hasOwnProperty.call(clipboard, assetId) as boolean;
        },
        [clipboard]
    );

    const toggleClipboardState = useCallback(
        (assetIdentity: AssetIdentity, force?: boolean) =>
            mutateClipboard({
                variables: { ...assetIdentity, force },
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

    const flushClipboard = useCallback(() => {
        Object.values(clipboard).map((assetIdentity) => {
            toggleClipboardState(assetIdentity, false);
        });
    }, [clipboard, toggleClipboardState]);

    return { clipboard: clipboard ?? {}, inClipboard, toggleClipboardState, flushClipboard };
}
