import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { AssetCollection, Tag } from '../interfaces';
import { currentPageState, selectedAssetCollectionIdState, selectedAssetIdState, selectedTagIdState } from '../state';
import selectedInspectorViewState from '../state/selectedInspectorViewState';

const useSelectTag = () => {
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const setSelectedTagId = useSetRecoilState(selectedTagIdState);
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);
    const setCurrentPage = useSetRecoilState(currentPageState);

    return useCallback(
        (tag: Tag, assetCollection: AssetCollection = null) => {
            setSelectedInspectorView('tag');
            setSelectedAssetCollectionId(assetCollection?.id);
            setSelectedTagId(tag?.id);
            setCurrentPage(1);
            setSelectedAssetId(null);
        },
        [setCurrentPage, setSelectedAssetCollectionId, setSelectedAssetId, setSelectedInspectorView, setSelectedTagId]
    );
};
export default useSelectTag;
