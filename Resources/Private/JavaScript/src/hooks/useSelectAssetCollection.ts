import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { AssetCollection } from '../interfaces';
import { selectedAssetCollectionIdState, selectedAssetIdState, selectedTagState } from '../state';
import selectedInspectorViewState from '../state/selectedInspectorViewState';

const useSelectAssetCollection = () => {
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const setSelectedTag = useSetRecoilState(selectedTagState);
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);
    return useCallback(
        (assetCollection: AssetCollection | null) => {
            setSelectedInspectorView('assetCollection');
            setSelectedTag(null);
            setSelectedAssetId(null);
            setSelectedAssetCollectionId(assetCollection?.id);
        },
        [setSelectedInspectorView, setSelectedTag, setSelectedAssetId, setSelectedAssetCollectionId]
    );
};
export default useSelectAssetCollection;
