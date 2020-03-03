import { ApolloCache } from 'apollo-cache';
import { NormalizedCacheObject } from 'apollo-cache-inmemory/lib/types';
import PersistentState from '../interfaces/PersistentState';

const STORAGE_PREFIX = 'flowpack.mediaui';

export function restoreLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    const data: PersistentState = {
        assetSourceFilter: localStorage.getItem(`${STORAGE_PREFIX}.assetSourceFilter`) || 'neos'
    };

    console.debug(data, 'Restored data from localstorage');
    cache.writeData({ data });
}

export function resetLocalState(cache: ApolloCache<NormalizedCacheObject>) {
    const data: PersistentState = {
        assetSourceFilter: 'neos'
    };

    console.debug(data, 'Reset data in localstorage');
    cache.writeData({ data });
}

export function updateLocalState(data: object, cache: ApolloCache<NormalizedCacheObject>) {
    console.debug(data, 'Updated locate state');
    Object.keys(data).forEach(key => localStorage.setItem(`${STORAGE_PREFIX}.${key}`, data[key]));
    cache.writeData({ data });
}
