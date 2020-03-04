import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
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

    // Main query to fetch all initial data from api
    const { loading, error, data } = useQuery<AssetProxiesQueryResult, AssetProxiesQueryVariables>(ASSET_PROXIES, {
        notifyOnNetworkStatusChange: true,
        variables: {
            assetCollection: assetCollectionFilter?.title,
            assetType: assetTypeFilter?.label,
            tag: tagFilter?.label,
            limit: ASSETS_PER_PAGE,
            offset: (currentPage - 1) * ASSETS_PER_PAGE
        }
    });

    const assetProxies: AssetProxy[] = data?.assetProxies || [];
    const assetCollections: AssetCollection[] = data?.assetCollections || [];
    const assetSources: AssetSource[] = data?.assetSources || [];
    const assetCount: number = data?.assetCount || 0;
    const assetTypes: AssetType[] = data?.assetTypes || [];
    const tags: Tag[] = data?.tags || [];

    const isLoading: boolean = loading;

    if ((currentPage - 1) * ASSETS_PER_PAGE > assetCount) {
        setCurrentPage(1);
    }

    if (error) {
        console.error(error);
    }

    return (
        <>
            <MediaUiContext.Provider
                value={{
                    csrf,
                    endpoints,
                    isLoading,
                    assetProxies,
                    tags,
                    assetCollections,
                    notify,
                    assetCount,
                    tagFilter,
                    setTagFilter,
                    assetCollectionFilter,
                    setAssetCollectionFilter,
                    assetSources,
                    assetTypes,
                    assetTypeFilter,
                    setAssetTypeFilter,
                    currentPage,
                    setCurrentPage,
                    selectedAsset,
                    setSelectedAsset,
                    dummyImage
                }}
            >
                {error ? <p>{error.message}</p> : !assetProxies && loading ? <p>Loading...</p> : children}
            </MediaUiContext.Provider>
        </>
    );
}
