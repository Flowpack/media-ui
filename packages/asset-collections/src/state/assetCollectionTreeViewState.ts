import { atom } from 'recoil';
import { localStorageEffect } from '@media-ui/core/src/state';

export const assetCollectionTreeViewState = atom<'collections' | 'favourites'>({
    key: 'AssetCollectionTreeViewState',
    default: 'collections',
    effects: [localStorageEffect('AssetCollectionTreeViewState')],
});
