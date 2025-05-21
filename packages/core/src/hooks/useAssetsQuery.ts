import { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useLazyQuery } from '@apollo/client';

import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';
import { selectedAssetSourceState } from '@media-ui/feature-asset-sources';

import { SORT_BY, SORT_DIRECTION } from '../state/selectedSortOrderState';
import {
    availableAssetsState,
    currentPageState,
    featureFlagsState,
    initialLoadCompleteState,
    loadingState,
    searchTermState,
    selectedAssetTypeState,
    selectedMediaTypeState,
    selectedSortOrderState,
} from '../state';
import { ASSETS } from '../queries';

interface AssetsQueryResult {
    assets: Asset[];
    assetCollections: AssetCollection[];
    assetSources: AssetSource[];
    assetCount: number;
    tags: Tag[];
}

interface AssetsQueryVariables {
    searchTerm: string;
    assetSourceId: string;
    assetCollectionId: string;
    mediaType: MediaType | '';
    assetType: AssetType | '';
    tagId: string;
    limit: number;
    offset: number;
    sortBy: SORT_BY;
    sortDirection: SORT_DIRECTION;
}

const useAssetsQuery = () => {
    const {
        pagination: { assetsPerPage },
    } = useRecoilValue(featureFlagsState);
    const searchTerm = useRecoilValue(searchTermState);
    const assetCollectionId = useRecoilValue(selectedAssetCollectionIdState);
    const assetSourceId = useRecoilValue(selectedAssetSourceState);
    const selectedTagId = useRecoilValue(selectedTagIdState);
    const mediaType = useRecoilValue(selectedMediaTypeState);
    const assetType = useRecoilValue(selectedAssetTypeState);
    const sortOrderState = useRecoilValue(selectedSortOrderState);
    const currentPage = useRecoilValue(currentPageState);
    const setIsLoading = useSetRecoilState(loadingState);
    const setInitialLoadComplete = useSetRecoilState(initialLoadCompleteState);
    const [assets, setAssets] = useRecoilState(availableAssetsState);

    const offset = (currentPage - 1) * assetsPerPage;

    const [query, { loading, error, data, refetch }] = useLazyQuery<AssetsQueryResult, AssetsQueryVariables>(ASSETS, {
        notifyOnNetworkStatusChange: false,
        variables: {
            searchTerm: searchTerm.toString(),
            assetSourceId,
            assetCollectionId,
            assetType,
            mediaType,
            tagId: selectedTagId,
            limit: assetsPerPage,
            offset,
            sortBy: sortOrderState.sortBy,
            sortDirection: sortOrderState.sortDirection,
        },
    });

    useEffect(() => {
        if (!loading) {
            query({
                variables: {
                    searchTerm: searchTerm.toString(),
                    assetSourceId,
                    assetCollectionId,
                    assetType,
                    mediaType,
                    tagId: selectedTagId,
                    limit: assetsPerPage,
                    offset,
                    sortBy: sortOrderState.sortBy,
                    sortDirection: sortOrderState.sortDirection,
                },
            });
            setIsLoading(true);
        }
    }, [
        query,
        loading,
        offset,
        searchTerm,
        assetSourceId,
        assetCollectionId,
        mediaType,
        selectedTagId,
        sortOrderState,
        assetType,
        assetsPerPage,
        setIsLoading,
    ]);

    useEffect(() => {
        if (!loading && data) {
            setAssets((prev) => {
                const sameSame = data && JSON.stringify(prev) == JSON.stringify(data.assets);
                return sameSame ? prev : data.assets || [];
            });
            setIsLoading(false);
            setInitialLoadComplete(true);
        }
    }, [loading, data, setAssets, setInitialLoadComplete, setIsLoading]);

    return { error, assets, refetch };
};

export default useAssetsQuery;
