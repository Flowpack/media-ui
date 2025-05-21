import { atom } from 'recoil';
import { localStorageEffect } from '@media-ui/core/src/state';

export const selectedAssetCollectionIdState = atom<string | null>({
    key: 'SelectedAssetCollectionIdState',
    default: null,
    effects: [localStorageEffect('SelectedAssetCollectionIdState')],
});
