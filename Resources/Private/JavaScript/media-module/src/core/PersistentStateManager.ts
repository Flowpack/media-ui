import { ApolloCache } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';

import { CLIPBOARD, ClipboardItems } from '@media-ui/feature-clipboard/src';

const STORAGE_PREFIX = 'flowpack.mediaui';

// TODO: Replace all of this with the recoil storage effect
interface PersistentState {
    clipboard?: ClipboardItems;
}

function writeToCache(cache: ApolloCache<NormalizedCacheObject>, { clipboard = undefined }: PersistentState) {
    if (clipboard !== undefined) {
        cache.writeQuery({
            query: CLIPBOARD,
            data: { clipboard },
        });
    }
}

export function getItem<T>(key): T {
    try {
        return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}.${key}`)) as unknown as T;
    } catch (e) {
        console.error(`Could not parse item "${key}" from storage`, e);
    }
    return undefined;
}

export function restoreLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    const clipboard = getItem<ClipboardItems>('clipboard') || {};

    writeToCache(cache, { clipboard });
}

export function updateLocalState(data: PersistentState, cache: ApolloCache<NormalizedCacheObject>) {
    Object.keys(data).forEach((key) => {
        localStorage.setItem(`${STORAGE_PREFIX}.${key}`, JSON.stringify(data[key]));
    });
    writeToCache(cache, { ...data });
}
