import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { AssetSource, AssetCollection, Asset, Tag } from '../interfaces';
import { useAssetQuery } from '../hooks';
import { useNotify } from './index';

interface MediaUiProviderProps {
    children: React.ReactElement;
    dummyImage: string;
    selectionMode?: boolean;
    containerRef: React.ElementRef<any>;
    onAssetSelection?: (localAssetIdentifier: string) => void;
}

interface MediaUiProviderValues {
    assetCollectionFilter: AssetCollection;
    assetCollections: AssetCollection[];
    assetCount: number;
    assetSources: AssetSource[];
    assets: Asset[];
    containerRef: React.ElementRef<any>;
    currentPage: number;
    dummyImage: string;
    isLoading: boolean;
    mediaTypeFilter: string;
    refetchAssets: () => Promise<boolean>;
    searchTerm: string;
    selectedAsset: Asset;
    selectedAssetForPreview: Asset;
    selectionMode: boolean;
    setAssetCollectionFilter: (assetCollection: AssetCollection) => void;
    setCurrentPage: (currentPage: number) => void;
    setMediaTypeFilter: (mediaType: string) => void;
    setSearchTerm: (searchTerm: string) => void;
    setSelectedAsset: (asset: Asset) => void;
    setSelectedAssetForPreview: (asset: Asset) => void;
    setTagFilter: (tag: Tag) => void;
    tagFilter: Tag;
    tags: Tag[];
}

export const MediaUiContext = createContext({} as MediaUiProviderValues);
export const useMediaUi = (): MediaUiProviderValues => useContext(MediaUiContext);

export const ASSETS_PER_PAGE = 20;

export function MediaUiProvider({
    children,
    dummyImage,
    selectionMode = false,
    onAssetSelection = null,
    containerRef
}: MediaUiProviderProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [tagFilter, setTagFilter] = useState<Tag>(null);
    const [assetCollectionFilter, setAssetCollectionFilter] = useState<AssetCollection>();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAsset, setSelectedAsset] = useState<Asset>();
    const [selectedAssetForPreview, setSelectedAssetForPreview] = useState<Asset>();
    const [mediaTypeFilter, setMediaTypeFilter] = useState('');
    const Notify = useNotify();

    // Main query to fetch all initial data from api
    const { isLoading, error, assetData, refetchAssets } = useAssetQuery({
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

    useEffect(() => {
        if (!onAssetSelection || !selectedAsset) {
            return;
        }
        if (selectedAsset.localId) {
            onAssetSelection(selectedAsset.localId);
        } else {
            // TODO: Implement import
            Notify.warning('Selecting external assets has not been implemented yet');
        }
    }, [selectedAsset]);

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
                    refetchAssets,
                    ...assetData
                }}
            >
                {children}
            </MediaUiContext.Provider>
        </>
    );
}
