import { ApolloCache } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';
import { VIEW_MODES } from '../hooks';
import { CLIPBOARD, SELECTED_ASSET_SOURCE_ID, VIEW_MODE_SELECTION } from '../queries';
import { Neos } from '../constants';
import { AssetIdentity } from '../interfaces';

const STORAGE_PREFIX = 'flowpack.mediaui';

interface PersistentState {
    selectedAssetSourceId?: string;
    viewModeSelection?: string;
    clipboard?: AssetIdentity[];
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
        selectedAssetSourceId: getItem<string>('selectedAssetSourceId') || Neos.NEOS_ASSET_SOURCE,
        viewModeSelection: getItem<string>('viewModeSelection') || VIEW_MODES.Thumbnails,
        clipboard: getItem<AssetIdentity[]>('clipboard') || [],
    });
}

export function resetLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    writeToCache(cache, {
        selectedAssetSourceId: Neos.NEOS_ASSET_SOURCE,
        viewModeSelection: VIEW_MODES.Thumbnails,
        clipboard: [],
    });
}

export function updateLocalState(data: PersistentState, cache: ApolloCache<NormalizedCacheObject>) {
    Object.keys(data).forEach((key) => {
        localStorage.setItem(`${STORAGE_PREFIX}.${key}`, JSON.stringify(data[key]));
    });
    writeToCache(cache, { ...data });
}
