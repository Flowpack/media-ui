import { atom } from 'recoil';
import { AssetSource } from '../interfaces';

const selectedAssetSourceState = atom<AssetSource>({
    key: 'selectedAssetSourceState',
    default: null
});

export default selectedAssetSourceState;
