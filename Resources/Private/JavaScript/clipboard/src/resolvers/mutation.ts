import { ApolloCache, NormalizedCacheObject } from '@apollo/client';

import { AssetIdentity } from '@media-ui/core/src/interfaces';

import { CLIPBOARD } from '../queries/ClipboardQuery';
import { ClipboardItems } from '../hooks/useClipboard';

const buildResolvers = (updateLocalState) => {
    return {
        Mutation: {
            addOrRemoveFromClipboard: (
                _,
                assetIdentity: AssetIdentity,
                { cache }: { cache: ApolloCache<NormalizedCacheObject> }
            ) => {
                let { clipboard }: { clipboard: ClipboardItems } = cache.readQuery({ query: CLIPBOARD });
                if ({}.hasOwnProperty.call(clipboard, assetIdentity.assetId)) {
                    clipboard = Object.values(clipboard).reduce((carry, item) => {
                        if (item.assetId !== assetIdentity.assetId) {
                            carry[item.assetId] = item;
                        }
                        return carry;
                    }, {});
                } else {
                    clipboard = { ...clipboard, [assetIdentity.assetId]: assetIdentity };
                }
                updateLocalState({ clipboard }, cache);
                return clipboard;
            },
        },
    };
};

export default buildResolvers;
