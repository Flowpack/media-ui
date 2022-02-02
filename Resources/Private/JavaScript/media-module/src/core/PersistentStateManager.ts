import { ApolloCache } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';

import { SELECTED_ASSET_SOURCE_ID, SELECTED_TAG_ID, SELECTED_COLLECTION_ID } from '@media-ui/core/src/queries';
import { NEOS_ASSET_SOURCE } from '@media-ui/core/src/constants/neos';

import { VIEW_MODES } from '../hooks';
import { VIEW_MODE_SELECTION } from '../queries';
import { CLIPBOARD, ClipboardItems } from '@media-ui/feature-clipboard/src';

const STORAGE_PREFIX = 'flowpack.mediaui';

interface PersistentState {
    selectedAssetSourceId?: string;
    viewModeSelection?: string;
    selectedTagId?: string;
    selectedCollectionId?: string;
    clipboard?: ClipboardItems;
}

function writeToCache(
    cache: ApolloCache<NormalizedCacheObject>,
    {
        selectedAssetSourceId = null,
        viewModeSelection = null,
        clipboard = null,
        selectedTagId = null,
        selectedCollectionId = null,
    }: PersistentState
) {
    if (selectedAssetSourceId !== null) {
        cache.writeQuery({
            query: SELECTED_ASSET_SOURCE_ID,
            data: { selectedAssetSourceId },
        });
    }
    if (viewModeSelection !== null) {
        cache.writeQuery({
            query: VIEW_MODE_SELECTION,
            data: { viewModeSelection },
        });
    }
    if (clipboard !== null) {
        cache.writeQuery({
            query: CLIPBOARD,
            data: { clipboard },
        });
    }
    if (selectedTagId !== null) {
        cache.writeQuery({
            query: SELECTED_TAG_ID,
            data: { selectedTagId },
        });
    }
    if (selectedCollectionId !== null) {
        cache.writeQuery({
            query: SELECTED_COLLECTION_ID,
            data: { selectedCollectionId },
        });
    }
}

export function getItem<T>(key): T {
    let result = undefined;
    try {
        result = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}.${key}`)) as unknown;
    } catch (e) {
        console.error(e.message);
    }
    return result as T;
}

export function restoreLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    writeToCache(cache, {
        selectedAssetSourceId: getItem<string>('selectedAssetSourceId') || NEOS_ASSET_SOURCE,
        viewModeSelection: getItem<string>('viewModeSelection') || VIEW_MODES.Thumbnails,
        clipboard: getItem<ClipboardItems>('clipboard') || {},
        selectedTagId: getItem<string>('selectedTagId'),
        selectedCollectionId: getItem<string>('selectedCollectionId'),
    });
}

export function resetLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    writeToCache(cache, {
        selectedAssetSourceId: NEOS_ASSET_SOURCE,
        viewModeSelection: VIEW_MODES.Thumbnails,
        clipboard: {},
        selectedTagId: null,
        selectedCollectionId: null,
    });
}

export function updateLocalState(data: PersistentState, cache: ApolloCache<NormalizedCacheObject>) {
    Object.keys(data).forEach((key) => {
        localStorage.setItem(`${STORAGE_PREFIX}.${key}`, JSON.stringify(data[key]));
    });
    writeToCache(cache, { ...data });
}
