import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useMediaUi } from '../provider';
import { Asset } from '../interfaces';
import { selectedAssetIdState } from '../state';
import selectedInspectorViewState from '../state/selectedInspectorViewState';

const useSelectAsset = () => {
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);
    const { handleSelectAsset } = useMediaUi();
    return useCallback(
        (asset: Asset) => {
            setSelectedAssetId({ assetId: asset.id, assetSourceId: asset.assetSource.id });
            handleSelectAsset(asset);
            setSelectedInspectorView('asset');
        },
        [setSelectedAssetId, handleSelectAsset, setSelectedInspectorView]
    );
};
export default useSelectAsset;
