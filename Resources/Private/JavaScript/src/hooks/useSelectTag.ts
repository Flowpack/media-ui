import { useSetRecoilState } from 'recoil';
import { Tag } from '../interfaces';
import { selectedAssetCollectionIdState, selectedAssetIdState, selectedTagState } from '../state';
import selectedInspectorViewState from '../state/selectedInspectorViewState';

const useSelectTag = () => {
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const setSelectedTag = useSetRecoilState(selectedTagState);
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);

    return (tag: Tag, assetCollection = null) => {
        setSelectedInspectorView('tag');
        setSelectedAssetCollectionId(assetCollection?.id);
        setSelectedTag(tag);
        setSelectedAssetId(null);
    };
};
export default useSelectTag;
