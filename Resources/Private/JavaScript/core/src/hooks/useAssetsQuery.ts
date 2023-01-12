import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useLazyQuery } from '@apollo/client';

import useSelectedAssetCollection from './useSelectedAssetCollection';
import useSelectedTag from './useSelectedTag';
import { Asset, AssetCollection, AssetSource, Tag } from '../interfaces';
import {
    searchTermState,
    selectedMediaTypeState,
    loadingState,
    currentPageState,
    initialLoadCompleteState,
    selectedSortOrderState,
} from '../state';
import { ASSETS } from '../queries';
import { SORT_BY, SORT_DIRECTION } from '../state/selectedSortOrderState';

interface AssetsQueryResult {
    assets: Asset[];
    assetCollections: AssetCollection[];
    assetSources: AssetSource[];
    assetCount: number;
    tags: Tag[];
}

interface AssetsQueryVariables {
    searchTerm: string;
    assetCollectionId: string;
    mediaType: string;
    tagId: string;
    limit: number;
    offset: number;
    sortBy: SORT_BY;
    sortDirection: SORT_DIRECTION;
}

const useAssetsQuery = (paginationConfig: PaginationConfig) => {
    const { assetsPerPage } = paginationConfig;
    const searchTerm = useRecoilValue(searchTermState);
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedTag = useSelectedTag();
    const mediaTypeFilter = useRecoilValue(selectedMediaTypeState);
    const sortOrderState = useRecoilValue(selectedSortOrderState);
    const currentPage = useRecoilValue(currentPageState);
    const [isLoading, setIsLoading] = useRecoilState(loadingState);
    const setInitialLoadComplete = useSetRecoilState(initialLoadCompleteState);
    const [assets, setAssets] = useState<Asset[]>([]);

    const offset = (currentPage - 1) * assetsPerPage;

    const [query, { loading, error, data, refetch }] = useLazyQuery<AssetsQueryResult, AssetsQueryVariables>(ASSETS, {
        notifyOnNetworkStatusChange: false,
        variables: {
            searchTerm: searchTerm.toString(),
            assetCollectionId: selectedAssetCollection?.id,
            mediaType: mediaTypeFilter,
            tagId: selectedTag?.id,
            limit: assetsPerPage,
            offset,
            sortBy: sortOrderState.sortBy,
            sortDirection: sortOrderState.sortDirection,
        },
    });

    useEffect(() => {
        if (!loading && !isLoading) {
            query({
                variables: {
                    searchTerm: searchTerm.toString(),
                    assetCollectionId: selectedAssetCollection?.id,
                    mediaType: mediaTypeFilter,
                    tagId: selectedTag?.id,
                    limit: assetsPerPage,
                    offset,
                    sortBy: sortOrderState.sortBy,
                    sortDirection: sortOrderState.sortDirection,
                },
            });
            setIsLoading(true);
        } else if (data && !loading && isLoading) {
            setIsLoading(false);
            setInitialLoadComplete(true);
            setAssets(data.assets);
            // TODO: Update currentPage if asset count changes and current page exceeds limit
        }
        // Don't include `isLoading` to prevent constant reloads
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        query,
        data,
        loading,
        offset,
        searchTerm,
        selectedAssetCollection?.title,
        mediaTypeFilter,
        selectedTag?.id,
        sortOrderState,
    ]);

    return { error, assets, refetch };
};

export default useAssetsQuery;
