import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import MediaUiProviderValues from '../interfaces/MediaUiProviderValues';
import AssetSource from '../interfaces/AssetSource';
import Tag from '../interfaces/Tag';
import AssetCollection from '../interfaces/AssetCollection';
import MediaUiProviderProps from '../interfaces/MediaUiProviderProps';
import AssetProxy from '../interfaces/AssetProxy';
import AssetType from '../interfaces/AssetType';
import { ASSET_PROXIES } from '../queries/AssetProxies';

interface AssetProxiesQueryResult {
    assetProxies: AssetProxy[];
    assetCollections: AssetCollection[];
    assetSources: AssetSource[];
    assetTypes: AssetType[];
    assetCount: number;
    tags: Tag[];
}

interface AssetProxiesQueryVariables {
    assetCollection: string;
    assetType: string;
    tag: string;
    limit: number;
    offset: number;
}

export const MediaUiContext = createContext({} as MediaUiProviderValues);
export const useMediaUi = (): MediaUiProviderValues => useContext(MediaUiContext);

export const ASSETS_PER_PAGE = 20;

export function MediaUiProvider({ children, csrf, endpoints, notify, dummyImage }: MediaUiProviderProps) {
    const [tagFilter, setTagFilter] = useState<Tag>();
    const [assetCollectionFilter, setAssetCollectionFilter] = useState<AssetCollection>();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAsset, setSelectedAsset] = useState<AssetProxy>();
    const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType>();
    const [uiState, setUiState] = useState<AssetProxiesQueryResult>({
        assetProxies: [],
        assetCollections: [],
        assetSources: [],
        assetCount: 0,
        assetTypes: [],
        tags: []
    });
    const [isLoading, setIsLoading] = useState(false);

    // Main query to fetch all initial data from api
    const [query, { loading, error, data }] = useLazyQuery<AssetProxiesQueryResult, AssetProxiesQueryVariables>(
        ASSET_PROXIES,
        {
            notifyOnNetworkStatusChange: false
        }
    );

    useEffect(() => {
        if (!loading && !isLoading) {
            query({
                variables: {
                    assetCollection: assetCollectionFilter?.title,
                    assetType: assetTypeFilter?.label,
                    tag: tagFilter?.label,
                    limit: ASSETS_PER_PAGE,
                    offset: (currentPage - 1) * ASSETS_PER_PAGE
                }
            });
            setIsLoading(true);
        }
        if (data && !loading && isLoading) {
            setUiState({ ...data });
            if ((currentPage - 1) * ASSETS_PER_PAGE > data.assetCount) {
                setCurrentPage(1);
            }
            setIsLoading(false);
        }
    }, [query, data, loading, assetCollectionFilter, assetTypeFilter, tagFilter, currentPage]);

    if (error) {
        console.error(error);
        return <p>{error.message}</p>;
    }

    return (
        <>
            <MediaUiContext.Provider
                value={{
                    csrf,
                    endpoints,
                    isLoading,
                    notify,
                    tagFilter,
                    setTagFilter,
                    assetCollectionFilter,
                    setAssetCollectionFilter,
                    assetTypeFilter,
                    setAssetTypeFilter,
                    currentPage,
                    setCurrentPage,
                    selectedAsset,
                    setSelectedAsset,
                    dummyImage,
                    ...uiState
                }}
            >
                {children}
            </MediaUiContext.Provider>
        </>
    );
}
