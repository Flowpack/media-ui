import { useSetRecoilState } from 'recoil';
import { AssetCollection, Tag } from '../interfaces';
import { selectedAssetCollectionIdState, selectedAssetIdState, selectedTagIdState } from '../state';
import selectedInspectorViewState from '../state/selectedInspectorViewState';

const useSelectTag = () => {
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const setSelectedTagId = useSetRecoilState(selectedTagIdState);
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);

    return (tag: Tag, assetCollection: AssetCollection = null) => {
        setSelectedInspectorView('tag');
        setSelectedAssetCollectionId(assetCollection?.id);
        setSelectedTagId(tag?.id);
        setSelectedAssetId(null);
    };
};
export default useSelectTag;
