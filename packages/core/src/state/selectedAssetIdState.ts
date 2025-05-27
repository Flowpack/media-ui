import { atomFamily, selector } from 'recoil';

import { localStorageEffect } from './localStorageEffect';
import { applicationContextState } from './applicationContextState';

const selectedAssetIdForContextState = atomFamily<AssetIdentity, ApplicationContext>({
    key: 'selectedAssetIdForContextState',
    default: null,
    effects: (applicationContext) => [
        localStorageEffect('selectedAssetIdForContextState', undefined, applicationContext),
    ],
});

export const selectedAssetIdState = selector<AssetIdentity>({
    key: 'selectedAssetIdState',
    get: ({ get }) => get(selectedAssetIdForContextState(get(applicationContextState))),
    set: ({ get, set }, assetIdentity) =>
        set(selectedAssetIdForContextState(get(applicationContextState)), assetIdentity),
});
