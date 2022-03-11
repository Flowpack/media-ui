import { ApolloCache } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';

import { SELECTED_ASSET_SOURCE_ID } from '@media-ui/core/src/queries';
import { NEOS_ASSET_SOURCE } from '@media-ui/core/src/constants/neos';

import { VIEW_MODES } from '../hooks';
import { VIEW_MODE_SELECTION } from '../queries';
import { CLIPBOARD, ClipboardItems } from '@media-ui/feature-clipboard/src';
import { SelectionConstraints } from '@media-ui/core/src/interfaces';

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
    try {
        return (JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}.${key}`)) as unknown) as T;
    } catch (e) {
        console.error(`Could not parse item "${key}" from storage`, e);
    }
    return undefined;
}

export function restoreLocalState(cache: ApolloCache<NormalizedCacheObject>, constraints: SelectionConstraints = {}) {
    let selectedAssetSourceId = getItem<string>('selectedAssetSourceId') || NEOS_ASSET_SOURCE;

    if (constraints.assetSources?.length > 0 && !constraints.assetSources.includes(selectedAssetSourceId)) {
        selectedAssetSourceId = constraints.assetSources[0];
    }

    const viewModeSelection = getItem<string>('viewModeSelection') || VIEW_MODES.Thumbnails;
    const clipboard = getItem<ClipboardItems>('clipboard') || {};

    writeToCache(cache, { selectedAssetSourceId, viewModeSelection, clipboard });
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
