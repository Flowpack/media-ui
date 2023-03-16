import { ApolloCache } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';

import { SELECTED_ASSET_SOURCE_ID } from '@media-ui/core/src/queries';
import { NEOS_ASSET_SOURCE } from '@media-ui/core/src/constants/neos';
import { SelectionConstraints } from '@media-ui/core/src/interfaces';
import { CLIPBOARD, ClipboardItems } from '@media-ui/feature-clipboard/src';

import { VIEW_MODES } from '../hooks';
import { VIEW_MODE_SELECTION } from '../queries';

const STORAGE_PREFIX = 'flowpack.mediaui';

// TODO: Replace all of this with the recoil storage effect
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

/**
 * This is a custom recoil storage effect that allows us to persist state in local storage.
 * It can be added to any atom as effect.
 */
export const localStorageEffect =
    (key: string) =>
    ({ setSelf, onSet }) => {
        const fullKey = `${STORAGE_PREFIX}.${key}`;
        const savedValue = localStorage.getItem(fullKey);
        if (savedValue != null) {
            setSelf(JSON.parse(savedValue));
        }

        onSet((newValue, _, isReset) => {
            isReset ? localStorage.removeItem(fullKey) : localStorage.setItem(fullKey, JSON.stringify(newValue));
        });
    };

export function getItem<T>(key): T {
    try {
        return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}.${key}`)) as unknown as T;
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
