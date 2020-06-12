import { ApolloCache } from 'apollo-cache';
import { NormalizedCacheObject } from 'apollo-cache-inmemory/lib/types';
import { PersistentState } from '../interfaces';
import { VIEW_MODES } from '../hooks';

const STORAGE_PREFIX = 'flowpack.mediaui';

export function restoreLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    const data: PersistentState = {
        assetSourceFilter: localStorage.getItem(`${STORAGE_PREFIX}.assetSourceFilter`) || 'neos', // TODO: Use global constant for fallback
        viewModeSelection: localStorage.getItem(`${STORAGE_PREFIX}.viewModeSelection`) || VIEW_MODES.Thumbnails
    };
    cache.writeData({ data: { ...data } });
}

export function resetLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    const data: PersistentState = {
        assetSourceFilter: 'neos', // TODO: Use global constant
        viewModeSelection: VIEW_MODES.Thumbnails
    };
    cache.writeData({ data: { ...data } });
}

export function updateLocalState(data: object, cache: ApolloCache<NormalizedCacheObject>) {
    Object.keys(data).forEach(key => localStorage.setItem(`${STORAGE_PREFIX}.${key}`, data[key]));
    cache.writeData({ data: { ...data } });
}
