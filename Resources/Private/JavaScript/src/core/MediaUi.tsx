import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import {
    AssetSource,
    AssetCollection,
    AssetProxy,
    AssetType,
    Tag,
    MediaUiProviderValues,
    MediaUiProviderProps
} from '../interfaces';
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
    searchTerm: string;
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
    const [searchTerm, setSearchTerm] = useState('');
    const [tagFilter, setTagFilter] = useState<Tag>();
    const [assetCollectionFilter, setAssetCollectionFilter] = useState<AssetCollection>();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAsset, setSelectedAsset] = useState<AssetProxy>();
    const [selectedAssetForPreview, setSelectedAssetForPreview] = useState<AssetProxy>();
    const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType>();
    // TODO: Use useReducer for state (like here https://github.com/sandstorm/NeosAcl/blob/master/Resources/Private/react-acl-editor/src/state/index.ts)
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
                    searchTerm: searchTerm,
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
    }, [query, data, loading, searchTerm, assetCollectionFilter, assetTypeFilter, tagFilter, currentPage]);

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
                    searchTerm,
                    setSearchTerm,
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
                    selectedAssetForPreview,
                    setSelectedAssetForPreview,
                    dummyImage,
                    ...uiState
                }}
            >
                {children}
            </MediaUiContext.Provider>
        </>
    );
}
