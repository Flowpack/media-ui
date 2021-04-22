import { ApolloCache, NormalizedCacheObject } from '@apollo/client';

import { AssetIdentity } from '@media-ui/core/src/interfaces';

import { CLIPBOARD } from '../queries/ClipboardQuery';

const buildResolvers = (updateLocalState) => {
    return {
        Mutation: {
            addOrRemoveFromClipboard: (
                _,
                assetIdentity: AssetIdentity,
                { cache }: { cache: ApolloCache<NormalizedCacheObject> }
            ) => {
                let { clipboard }: { clipboard: AssetIdentity[] } = cache.readQuery({ query: CLIPBOARD });
                if (clipboard.some(({ assetId }) => assetId === assetIdentity.assetId)) {
                    clipboard = clipboard.filter(({ assetId }) => assetId !== assetIdentity.assetId);
                } else {
                    clipboard = clipboard.concat([assetIdentity]);
                }
                updateLocalState({ clipboard }, cache);
                return clipboard;
            },
        },
    };
};

export default buildResolvers;
