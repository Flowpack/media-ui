import { useCallback, useMemo } from 'react';
import { useSetRecoilState } from 'recoil';
import { AssetCollection } from '../interfaces';
import { selectedInspectorViewState, selectedAssetIdState, currentPageState } from '../state';
import { SELECTED_COLLECTION_ID, SET_SELECTED_COLLECTION_ID, SET_SELECTED_TAG_ID } from '../queries';
import { useMutation, useQuery } from '@apollo/client';
import { useAssetCollectionsQuery } from './index';
import { ExecutionResult } from 'graphql';

const useSelectedAssetCollection = (): [
    AssetCollection,
    (assetCollection?: AssetCollection) => Promise<ExecutionResult<any>>
] => {
    const { data: { selectedCollectionId = null } = {} } = useQuery(SELECTED_COLLECTION_ID);
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedInspectorView = useSetRecoilState(selectedInspectorViewState);
    const setCurrentPage = useSetRecoilState(currentPageState);

    const { assetCollections } = useAssetCollectionsQuery();
    const selectedAssetCollection = useMemo(
        () => assetCollections.find((assetCollection) => assetCollection.id == selectedCollectionId),
        [assetCollections, selectedCollectionId]
    );

    const [mutateSelectedTagId] = useMutation(SET_SELECTED_TAG_ID);
    const [mutateSelectedAssetCollection] = useMutation(SET_SELECTED_COLLECTION_ID);
    const setSelectedAssetCollection = useCallback(
        (assetCollection: AssetCollection = null) => {
            setSelectedInspectorView('assetCollection');
            setSelectedAssetId(null);
            setCurrentPage(1);

            return mutateSelectedTagId({ variables: { tagId: null } }).then(() =>
                mutateSelectedAssetCollection({ variables: { collectionId: assetCollection?.id } })
            );
        },
        [
            setSelectedInspectorView,
            setSelectedAssetId,
            setCurrentPage,
            mutateSelectedTagId,
            mutateSelectedAssetCollection,
        ]
    );

    return [selectedAssetCollection, setSelectedAssetCollection];
};
export default useSelectedAssetCollection;
