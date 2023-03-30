import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useMediaUi } from '../provider';
import { selectedAssetIdState } from '../state';
import selectedInspectorViewState from '../state/selectedInspectorViewState';

const useSelectAsset = () => {
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);
    const { handleSelectAsset } = useMediaUi();
    return useCallback(
        (assetIdentity: AssetIdentity) => {
            if (!assetIdentity) return;
            setSelectedAssetId(assetIdentity);
            handleSelectAsset(assetIdentity);
            setSelectedInspectorView('asset');
        },
        [setSelectedAssetId, handleSelectAsset, setSelectedInspectorView]
    );
};
export default useSelectAsset;
