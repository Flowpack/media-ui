import { useSetRecoilState } from 'recoil';
import { AssetCollection, Tag } from '../interfaces';
import { selectedAssetCollectionIdState, selectedAssetIdState, selectedTagState } from '../state';
import selectedInspectorViewState from '../state/selectedInspectorViewState';

const useSelectTag = () => {
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const setSelectedTag = useSetRecoilState(selectedTagState);
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);

    return (tag: Tag, assetCollection: AssetCollection = null) => {
        setSelectedInspectorView('tag');
        setSelectedAssetCollectionId(assetCollection?.id);
        setSelectedTag(tag);
        setSelectedAssetId(null);
    };
};
export default useSelectTag;
