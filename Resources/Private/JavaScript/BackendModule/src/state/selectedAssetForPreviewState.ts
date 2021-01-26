import { atom } from 'recoil';

import { Asset } from '../interfaces';

const selectedAssetForPreviewState = atom<Asset>({
    key: 'selectedAssetForPreviewState',
    default: null
});

export default selectedAssetForPreviewState;
