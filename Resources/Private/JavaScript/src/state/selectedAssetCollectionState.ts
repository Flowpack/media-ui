import { atom } from 'recoil';
import { AssetCollection } from '../interfaces';

const selectedAssetCollectionState = atom<AssetCollection>({
    key: 'selectedAssetCollectionState',
    default: null
});

export default selectedAssetCollectionState;
