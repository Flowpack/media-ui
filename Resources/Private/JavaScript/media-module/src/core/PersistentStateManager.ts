import { ApolloCache } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';

import { CLIPBOARD, ClipboardItems } from '@media-ui/feature-clipboard/src';

import { VIEW_MODES } from '../hooks';
import { VIEW_MODE_SELECTION } from '../queries';

const STORAGE_PREFIX = 'flowpack.mediaui';

// TODO: Replace all of this with the recoil storage effect
interface PersistentState {
    viewModeSelection?: string;
    clipboard?: ClipboardItems;
}

function writeToCache(
    cache: ApolloCache<NormalizedCacheObject>,
    { viewModeSelection = undefined, clipboard = undefined }: PersistentState
) {
    if (viewModeSelection !== undefined) {
        cache.writeQuery({
            query: VIEW_MODE_SELECTION,
            data: { viewModeSelection },
        });
    }
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
    const viewModeSelection = getItem<string>('viewModeSelection') || VIEW_MODES.Thumbnails;
    const clipboard = getItem<ClipboardItems>('clipboard') || {};

    writeToCache(cache, { viewModeSelection, clipboard });
}

export function resetLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    writeToCache(cache, {
        viewModeSelection: VIEW_MODES.Thumbnails,
        clipboard: {},
    });
}

export function updateLocalState(data: PersistentState, cache: ApolloCache<NormalizedCacheObject>) {
    Object.keys(data).forEach((key) => {
        localStorage.setItem(`${STORAGE_PREFIX}.${key}`, JSON.stringify(data[key]));
    });
    writeToCache(cache, { ...data });
}
