import { atom } from 'recoil';
import { localStorageEffect } from '@media-ui/media-module/src/core/PersistentStateManager';

const selectedAssetCollectionIdState = atom<string | null>({
    key: 'SelectedAssetCollectionIdState',
    default: null,
    effects: [localStorageEffect('SelectedAssetCollectionIdState')],
});

export default selectedAssetCollectionIdState;
