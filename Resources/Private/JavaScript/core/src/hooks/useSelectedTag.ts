import { useCallback, useMemo } from 'react';
import { useSetRecoilState } from 'recoil';

import { AssetCollection, Tag } from '../interfaces';
import { currentPageState, selectedAssetIdState, selectedInspectorViewState } from '../state';
import { useMutation, useQuery } from '@apollo/client';
import { SELECTED_TAG_ID, SET_SELECTED_TAG_ID } from '../queries';
import { useSelectedAssetCollection, useTagsQuery } from './index';
import { ExecutionResult } from 'graphql';

const useSelectedTag = (): [Tag, (tag: Tag, assetCollection?: AssetCollection) => Promise<ExecutionResult<any>>] => {
    const { data: { selectedTagId = null } = {} } = useQuery(SELECTED_TAG_ID);
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);
    const setCurrentPage = useSetRecoilState(currentPageState);
    const [selectedAssetCollection, setSelectedAssetCollection] = useSelectedAssetCollection();
    const { tags } = useTagsQuery();
    const selectedTag = useMemo(() => tags.find((tag) => tag.id == selectedTagId), [tags, selectedTagId]);

    console.log('useSelectedTag', selectedTagId, selectedTag);

    const [mutateSelectedTagId] = useMutation(SET_SELECTED_TAG_ID);
    const setSelectedTag = useCallback(
        (tag: Tag = null, assetCollection: AssetCollection = null) => {
            console.log('setSelectedTag', tag, assetCollection);
            setSelectedInspectorView('tag');
            setCurrentPage(1);
            setSelectedAssetId(null);
            return setSelectedAssetCollection(assetCollection).then(() =>
                mutateSelectedTagId({ variables: { tagId: tag?.id } })
            );
        },
        [mutateSelectedTagId, setCurrentPage, setSelectedAssetCollection, setSelectedAssetId, setSelectedInspectorView]
    );

    return [selectedTag, setSelectedTag];
};
export default useSelectedTag;
