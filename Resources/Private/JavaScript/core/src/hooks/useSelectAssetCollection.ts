import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { AssetCollection } from '../interfaces';
import {
    selectedInspectorViewState,
    selectedAssetCollectionIdState,
    selectedAssetIdState,
    selectedTagIdState,
    currentPageState,
} from '../state';

const useSelectAssetCollection = () => {
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const setSelectedTagId = useSetRecoilState(selectedTagIdState);
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);
    const setCurrentPage = useSetRecoilState(currentPageState);

    return useCallback(
        (assetCollection: AssetCollection | null) => {
            setSelectedInspectorView('assetCollection');
            setSelectedTagId(null);
            setSelectedAssetId(null);
            setCurrentPage(1);
            setSelectedAssetCollectionId(assetCollection?.id);
        },
        [setSelectedInspectorView, setSelectedTagId, setSelectedAssetId, setCurrentPage, setSelectedAssetCollectionId]
    );
};
export default useSelectAssetCollection;
