import { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useLazyQuery } from '@apollo/client';

import { selectedTagIdState, Tag } from '@media-ui/feature-asset-tags';
import { AssetCollection, selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';
import { AssetSource, selectedAssetSourceState } from '@media-ui/feature-asset-sources';

import { SORT_BY, SORT_DIRECTION } from '../state/selectedSortOrderState';
import { Asset } from '../interfaces';
import {
    availableAssetsState,
    currentPageState,
    featureFlagsState,
    initialLoadCompleteState,
    loadingState,
    searchTermState,
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
    mediaType: string;
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
    const sortOrderState = useRecoilValue(selectedSortOrderState);
    const currentPage = useRecoilValue(currentPageState);
    const [isLoading, setIsLoading] = useRecoilState(loadingState);
    const setInitialLoadComplete = useSetRecoilState(initialLoadCompleteState);
    const [assets, setAssets] = useRecoilState(availableAssetsState);

    const offset = (currentPage - 1) * assetsPerPage;

    const [query, { loading, error, data, refetch }] = useLazyQuery<AssetsQueryResult, AssetsQueryVariables>(ASSETS, {
        notifyOnNetworkStatusChange: false,
        variables: {
            searchTerm: searchTerm.toString(),
            assetSourceId,
            assetCollectionId,
            mediaType,
            tagId: selectedTagId,
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
                    assetSourceId,
                    assetCollectionId,
                    mediaType,
                    tagId: selectedTagId,
                    limit: assetsPerPage,
                    offset,
                    sortBy: sortOrderState.sortBy,
                    sortDirection: sortOrderState.sortDirection,
                },
            });
            setIsLoading(true);
        } else if (data && !loading && isLoading) {
            // TODO: Use recoil transaction to handle all updates when available with the next release
            setIsLoading(false);
            setInitialLoadComplete(true);
            setAssets(data.assets);
            // TODO: Update currentPage if asset count changes and current page exceeds limit, maybe as atom effect?
        }
        // Don't include `isLoading` to prevent constant reloads
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        query,
        data,
        loading,
        offset,
        searchTerm,
        assetSourceId,
        assetCollectionId,
        mediaType,
        selectedTagId,
        sortOrderState,
    ]);

    return { error, assets, refetch };
};

export default useAssetsQuery;
