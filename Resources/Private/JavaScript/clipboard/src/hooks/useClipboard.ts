import { gql, useMutation, useQuery } from '@apollo/client';

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
            update: (cache) => {
                const { clipboard }: { clipboard: AssetIdentity[] } = cache.readQuery({ query: CLIPBOARD });
                cache.writeFragment({
                    id: cache.identify({ __typename: 'Asset', id: assetIdentity.assetId }),
                    fragment: gql`
                        fragment UpdatedAsset on Asset {
                            isInClipboard
                        }
                    `,
                    data: {
                        isInClipboard: clipboard.some(({ assetId }) => assetId === assetIdentity.assetId),
                    },
                });
            },
        });

    return { clipboard: clipboard ?? [], addOrRemoveFromClipboard };
}
