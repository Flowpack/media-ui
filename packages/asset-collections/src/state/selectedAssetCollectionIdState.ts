import { atomFamily } from 'recoil';
import { localStorageEffect } from '@media-ui/core/src/state';

export const selectedAssetCollectionIdState = atomFamily<AssetCollectionId | null, AssetSourceId>({
    key: 'SelectedAssetCollectionIdState',
    default: null,
    effects: [localStorageEffect('SelectedAssetCollectionIdState')],
});
