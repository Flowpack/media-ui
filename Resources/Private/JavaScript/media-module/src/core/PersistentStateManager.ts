import { ApolloCache } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';

import { SELECTED_ASSET_SOURCE_ID } from '@media-ui/core/src/queries';
import { NEOS_ASSET_SOURCE } from '@media-ui/core/src/constants/neos';

import { VIEW_MODES } from '../hooks';
import { VIEW_MODE_SELECTION } from '../queries';
import { CLIPBOARD, ClipboardItems } from '@media-ui/feature-clipboard/src';

const STORAGE_PREFIX = 'flowpack.mediaui';

interface PersistentState {
    selectedAssetSourceId?: string;
    viewModeSelection?: string;
    clipboard?: ClipboardItems;
}

function writeToCache(
    cache: ApolloCache<NormalizedCacheObject>,
    { selectedAssetSourceId = undefined, viewModeSelection = undefined, clipboard = undefined }: PersistentState
) {
    if (selectedAssetSourceId !== undefined) {
        cache.writeQuery({
            query: SELECTED_ASSET_SOURCE_ID,
            data: { selectedAssetSourceId },
        });
    }
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
    return (JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}.${key}`)) as unknown) as T;
}

export function restoreLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    writeToCache(cache, {
        selectedAssetSourceId: getItem<string>('selectedAssetSourceId') || NEOS_ASSET_SOURCE,
        viewModeSelection: getItem<string>('viewModeSelection') || VIEW_MODES.Thumbnails,
        clipboard: getItem<ClipboardItems>('clipboard') || {},
    });
}

export function resetLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    writeToCache(cache, {
        selectedAssetSourceId: NEOS_ASSET_SOURCE,
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
