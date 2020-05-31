import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { AssetSource, AssetCollection, Asset, Tag } from '../interfaces';
import { useAssetQuery } from '../hooks';

interface MediaUiProviderProps {
    children: React.ReactElement;
    dummyImage: string;
    selectionMode?: boolean;
    containerRef: React.ElementRef<any>;
}

interface MediaUiProviderValues {
    isLoading: boolean;
    assetCount: number;
    assets: Asset[];
    searchTerm: string;
    setSearchTerm: (searchTerm: string) => void;
    tags: Tag[];
    tagFilter: Tag;
    setTagFilter: (tag: Tag) => void;
    assetSources: AssetSource[];
    assetCollections: AssetCollection[];
    assetCollectionFilter: AssetCollection;
    setAssetCollectionFilter: (assetCollection: AssetCollection) => void;
    currentPage: number;
    setCurrentPage: (currentPage: number) => void;
    selectedAsset: Asset;
    setSelectedAsset: (asset: Asset) => void;
    selectedAssetForPreview: Asset;
    setSelectedAssetForPreview: (asset: Asset) => void;
    mediaTypeFilter: string;
    setMediaTypeFilter: (mediaType: string) => void;
    dummyImage: string;
    selectionMode: boolean;
    containerRef: React.ElementRef<any>;
}

export const MediaUiContext = createContext({} as MediaUiProviderValues);
export const useMediaUi = (): MediaUiProviderValues => useContext(MediaUiContext);

export const ASSETS_PER_PAGE = 20;

export function MediaUiProvider({ children, dummyImage, selectionMode = false, containerRef }: MediaUiProviderProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [tagFilter, setTagFilter] = useState<Tag>(null);
    const [assetCollectionFilter, setAssetCollectionFilter] = useState<AssetCollection>();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAsset, setSelectedAsset] = useState<Asset>();
    const [selectedAssetForPreview, setSelectedAssetForPreview] = useState<Asset>();
    const [mediaTypeFilter, setMediaTypeFilter] = useState('');

    // Main query to fetch all initial data from api
    const { isLoading, error, assetData } = useAssetQuery({
        searchTerm: searchTerm,
        assetCollection: assetCollectionFilter?.title,
        mediaType: mediaTypeFilter,
        tag: tagFilter?.label,
        limit: ASSETS_PER_PAGE,
        offset: (currentPage - 1) * ASSETS_PER_PAGE
    });

    // Update currentPage if asset count changes
    useEffect(() => {
        if (!isLoading && (currentPage - 1) * ASSETS_PER_PAGE > assetData.assetCount) {
            setCurrentPage(1);
        }
    }, [assetData.assetCount, isLoading]);

    if (error) {
        console.error(error);
        return <p>{error.message}</p>;
    }

    return (
        <>
            <MediaUiContext.Provider
                value={{
                    isLoading,
                    searchTerm,
                    setSearchTerm,
                    tagFilter,
                    setTagFilter,
                    assetCollectionFilter,
                    setAssetCollectionFilter,
                    mediaTypeFilter: mediaTypeFilter,
                    setMediaTypeFilter: setMediaTypeFilter,
                    currentPage,
                    setCurrentPage,
                    selectedAsset,
                    setSelectedAsset,
                    selectedAssetForPreview,
                    setSelectedAssetForPreview,
                    dummyImage,
                    selectionMode,
                    containerRef,
                    ...assetData
                }}
            >
                {children}
            </MediaUiContext.Provider>
        </>
    );
}
