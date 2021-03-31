import { ApolloCache } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';
import { VIEW_MODES } from '../hooks';
import { SELECTED_ASSET_SOURCE_ID, VIEW_MODE_SELECTION } from '../queries';
import { Neos } from '../constants';

const STORAGE_PREFIX = 'flowpack.mediaui';

interface PersistentState {
    selectedAssetSourceId?: string;
    viewModeSelection?: string;
}

function writeToCache(
    cache: ApolloCache<NormalizedCacheObject>,
    { selectedAssetSourceId = undefined, viewModeSelection = undefined }: PersistentState
) {
    if (selectedAssetSourceId !== undefined) {
        cache.writeQuery({
            query: SELECTED_ASSET_SOURCE_ID,
            data: { selectedAssetSourceId: selectedAssetSourceId },
        });
    }
    if (viewModeSelection !== undefined) {
        cache.writeQuery({
            query: VIEW_MODE_SELECTION,
            data: {
                viewModeSelection: viewModeSelection,
            },
        });
    }
}

export function restoreLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    writeToCache(cache, {
        selectedAssetSourceId:
            localStorage.getItem(`${STORAGE_PREFIX}.selectedAssetSourceId`) || Neos.NEOS_ASSET_SOURCE,
        viewModeSelection: localStorage.getItem(`${STORAGE_PREFIX}.viewModeSelection`) || VIEW_MODES.Thumbnails,
    });
}

export function resetLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    writeToCache(cache, {
        selectedAssetSourceId: Neos.NEOS_ASSET_SOURCE,
        viewModeSelection: VIEW_MODES.Thumbnails,
    });
}

export function updateLocalState(data: PersistentState, cache: ApolloCache<NormalizedCacheObject>) {
    Object.keys(data).forEach((key) => localStorage.setItem(`${STORAGE_PREFIX}.${key}`, data[key]));
    writeToCache(cache, { ...data });
}
