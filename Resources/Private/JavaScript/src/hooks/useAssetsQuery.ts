import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useLazyQuery } from '@apollo/react-hooks';

import { ASSETS } from '../queries';
import { Asset, AssetCollection, AssetSource, Tag } from '../interfaces';
import {
    currentPageState,
    loadingState,
    searchTermState,
    selectedAssetCollectionState,
    selectedMediaTypeState,
    selectedTagState
} from '../state';
import { ASSETS_PER_PAGE } from '../core';

interface AssetsQueryResult {
    assets: Asset[];
    assetCollections: AssetCollection[];
    assetSources: AssetSource[];
    assetCount: number;
    tags: Tag[];
}

interface AssetsQueryVariables {
    searchTerm: string;
    assetCollection: string;
    mediaType: string;
    tag: string;
    limit: number;
    offset: number;
}

const useAssetsQuery = () => {
    const searchTerm = useRecoilValue(searchTermState);
    const selectedAssetCollection = useRecoilValue(selectedAssetCollectionState);
    const selectedTag = useRecoilValue(selectedTagState);
    const mediaTypeFilter = useRecoilValue(selectedMediaTypeState);
    const [currentPage, setCurrentPage] = useRecoilState(currentPageState);
    const [isLoading, setIsLoading] = useRecoilState(loadingState);
    const [assets, setAssets] = useState<Asset[]>([]);

    const limit = ASSETS_PER_PAGE;
    const offset = (currentPage - 1) * ASSETS_PER_PAGE;

    const [query, { loading, error, data, refetch }] = useLazyQuery<AssetsQueryResult, AssetsQueryVariables>(ASSETS, {
        notifyOnNetworkStatusChange: false
    });

    useEffect(() => {
        if (!loading && !isLoading) {
            query({
                variables: {
                    searchTerm,
                    assetCollection: selectedAssetCollection?.title,
                    mediaType: mediaTypeFilter,
                    tag: selectedTag?.label,
                    limit,
                    offset
                }
            });
            setIsLoading(true);
        } else if (data && !loading && isLoading) {
            setIsLoading(false);
            setAssets(data.assets);

            // Update currentPage if asset count changes and current page exceeds limit
            setCurrentPage(prev => ((prev - 1) * limit > data.assetCount ? 1 : prev));
        }
        // Don't include `isLoading` to prevent constant reloads
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        query,
        data,
        loading,
        setCurrentPage,
        offset,
        limit,
        searchTerm,
        selectedAssetCollection?.title,
        mediaTypeFilter,
        selectedTag?.label
    ]);

    return { error, assets, refetchAssets: refetch };
};

export default useAssetsQuery;
