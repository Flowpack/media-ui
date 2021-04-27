import { ApolloCache, NormalizedCacheObject } from '@apollo/client';

import { CLIPBOARD } from '../queries/ClipboardQuery';
import { ClipboardItems } from '../hooks/useClipboard';

const buildResolvers = (updateLocalState) => {
    return {
        Mutation: {
            toggleClipboardState: (
                _,
                { assetId, assetSourceId, force },
                { cache }: { cache: ApolloCache<NormalizedCacheObject> }
            ) => {
                let { clipboard }: { clipboard: ClipboardItems } = cache.readQuery({ query: CLIPBOARD });
                if (force !== true && {}.hasOwnProperty.call(clipboard, assetId)) {
                    clipboard = Object.values(clipboard).reduce((carry, item) => {
                        if (item.assetId !== assetId) {
                            carry[item.assetId] = item;
                        }
                        return carry;
                    }, {});
                } else if (force !== false) {
                    clipboard = { ...clipboard, [assetId]: { assetId, assetSourceId } };
                }
                updateLocalState({ clipboard }, cache);
                return clipboard;
            },
        },
    };
};

export default buildResolvers;
