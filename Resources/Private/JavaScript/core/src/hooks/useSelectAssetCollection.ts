import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { clipboardVisibleState } from '@media-ui/feature-clipboard';
import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { AssetCollection, selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';

import { selectedInspectorViewState, selectedAssetIdState, currentPageState } from '../state';

// TODO: Move this hook into the asset collections package when the side effects can be triggered indirectly
const useSelectAssetCollection = () => {
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const setSelectedTagId = useSetRecoilState(selectedTagIdState);
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);
    const setCurrentPage = useSetRecoilState(currentPageState);
    const setClipboardVisibleState = useSetRecoilState(clipboardVisibleState);

    return useCallback(
        (assetCollection: AssetCollection | null) => {
            // FIXME: Run all setters in a single transaction when useRecoilTransaction is available in the next recoil release
            setSelectedInspectorView('assetCollection');
            setSelectedTagId(null);
            setSelectedAssetId(null);
            setCurrentPage(1);
            setSelectedAssetCollectionId(assetCollection?.id);
            setClipboardVisibleState(false);
        },
        [
            setSelectedInspectorView,
            setSelectedTagId,
            setSelectedAssetId,
            setCurrentPage,
            setSelectedAssetCollectionId,
            setClipboardVisibleState,
        ]
    );
};
export default useSelectAssetCollection;
