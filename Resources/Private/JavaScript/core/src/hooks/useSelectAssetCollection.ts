import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { AssetCollection } from '../interfaces';
import {
    selectedInspectorViewState,
    selectedAssetCollectionIdState,
    selectedAssetIdState,
    selectedTagIdState,
} from '../state';

const useSelectAssetCollection = () => {
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const setSelectedTagId = useSetRecoilState(selectedTagIdState);
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);
    return useCallback(
        (assetCollection: AssetCollection | null) => {
            setSelectedInspectorView('assetCollection');
            setSelectedTagId(null);
            setSelectedAssetId(null);
            setSelectedAssetCollectionId(assetCollection?.id);
        },
        [setSelectedInspectorView, setSelectedTagId, setSelectedAssetId, setSelectedAssetCollectionId]
    );
};
export default useSelectAssetCollection;
