import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';

import { currentPageState, selectedAssetIdState } from '../state';
import selectedInspectorViewState from '../state/selectedInspectorViewState';

// TODO: Move this hook into the tags package when the side effects can be triggered indirectly
const useSelectTag = () => {
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const setSelectedTagId = useSetRecoilState(selectedTagIdState);
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);
    const setCurrentPage = useSetRecoilState(currentPageState);

    return useCallback(
        (tagId: string | null, assetCollectionId: string | null) => {
            setSelectedInspectorView('tag');
            setSelectedAssetCollectionId(assetCollectionId);
            setSelectedTagId(tagId);
            setCurrentPage(1);
            setSelectedAssetId(null);
        },
        [setCurrentPage, setSelectedAssetCollectionId, setSelectedAssetId, setSelectedInspectorView, setSelectedTagId]
    );
};
export default useSelectTag;
