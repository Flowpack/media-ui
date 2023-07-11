import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useMediaUi } from '../provider';
import { selectedAssetIdState, selectedInspectorViewState } from '../state';

const useSelectAsset = () => {
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);
    const { handleSelectAsset, selectionMode } = useMediaUi();
    return useCallback(
        (assetIdentity: AssetIdentity) => {
            if (!assetIdentity) return;
            handleSelectAsset(assetIdentity);
            if (!selectionMode) {
                // Don't store the last selected asset during selection mode
                setSelectedAssetId(assetIdentity);
                setSelectedInspectorView('asset');
            }
        },
        [selectionMode, setSelectedAssetId, handleSelectAsset, setSelectedInspectorView]
    );
};
export default useSelectAsset;
