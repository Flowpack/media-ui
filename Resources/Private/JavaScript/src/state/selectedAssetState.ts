import { atom } from 'recoil';
import { Asset } from '../interfaces';

const selectedAssetState = atom<Asset>({
    key: 'selectedAssetState',
    default: null
});

export default selectedAssetState;
