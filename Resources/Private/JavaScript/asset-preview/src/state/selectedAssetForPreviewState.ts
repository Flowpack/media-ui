import { atom } from 'recoil';

import { AssetIdentity } from '@media-ui/core/src/interfaces';

const selectedAssetForPreviewState = atom<AssetIdentity>({
    key: 'selectedAssetForPreviewState',
    default: null,
});

export default selectedAssetForPreviewState;
