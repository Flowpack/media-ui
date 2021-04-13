import { atom } from 'recoil';

import { Asset } from '@media-ui/core/src/interfaces';

const selectedAssetForPreviewState = atom<Asset>({
    key: 'selectedAssetForPreviewState',
    default: null,
});

export default selectedAssetForPreviewState;
