import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { AssetSource, AssetCollection, Asset, Tag } from '../interfaces';
import { useAssetQuery, useAssetSourceFilter, useDeleteAsset, useImportAsset } from '../hooks';
import { useIntl, useNotify } from './index';
import { selectedAssetSourceState, selectedAssetState } from '../state';

interface MediaUiProviderProps {
    children: React.ReactElement;
    dummyImage: string;
    selectionMode?: boolean;
    containerRef: React.RefObject<HTMLDivElement>;
    onAssetSelection?: (localAssetIdentifier: string) => void;
    endpoints: {
        graphql: string;
        upload: string;
    };
}

interface MediaUiProviderValues {
    assetCollectionFilter: AssetCollection;
    assetCollections: AssetCollection[];
    assetCount: number;
    assetSources: AssetSource[];
    assets: Asset[];
    containerRef: React.RefObject<HTMLDivElement>;
    currentPage: number;
    dummyImage: string;
    endpoints: {
        graphql: string;
        upload: string;
    };
    isLoading: boolean;
    mediaTypeFilter: string;
    refetchAssets: () => Promise<boolean>;
    handleDeleteAsset: (asset: Asset) => void;
    searchTerm: string;
    selectionMode: boolean;
    setAssetCollectionFilter: (assetCollection: AssetCollection) => void;
    setCurrentPage: (currentPage: number) => void;
    setMediaTypeFilter: (mediaType: string) => void;
    setSearchTerm: (searchTerm: string) => void;
    setTagFilter: (tag: Tag) => void;
    tagFilter: Tag;
    tags: Tag[];
}

export const MediaUiContext = createContext({} as MediaUiProviderValues);
export const useMediaUi = (): MediaUiProviderValues => useContext(MediaUiContext);

// TODO: Make configurable via Settings
export const ASSETS_PER_PAGE = 20;

export function MediaUiProvider({
    children,
    dummyImage,
    selectionMode = false,
    onAssetSelection = null,
    containerRef
}: MediaUiProviderProps) {
    const { translate } = useIntl();
    const Notify = useNotify();
    const [searchTerm, setSearchTerm] = useState('');
    const [tagFilter, setTagFilter] = useState<Tag>(null);
    const [assetCollectionFilter, setAssetCollectionFilter] = useState<AssetCollection>();
    const [currentPage, setCurrentPage] = useState(1);
    const [mediaTypeFilter, setMediaTypeFilter] = useState('');
    const [assetSourceFilter] = useAssetSourceFilter();
    const [selectedAsset, setSelectedAsset] = useRecoilState(selectedAssetState);
    const setSelectedAssetSource = useSetRecoilState(selectedAssetSourceState);
    const { deleteAsset } = useDeleteAsset();
    const { importAsset } = useImportAsset();

    // Main query to fetch all initial data from api
    const { isLoading, error, assetData, refetchAssets } = useAssetQuery({
        searchTerm: searchTerm,
        assetCollection: assetCollectionFilter?.title,
        mediaType: mediaTypeFilter,
        tag: tagFilter?.label,
        limit: ASSETS_PER_PAGE,
        offset: (currentPage - 1) * ASSETS_PER_PAGE
    });

    const handleDeleteAsset = (asset: Asset) => {
        const confirm = window.confirm(
            translate('action.deleteAsset.confirm', 'Do you really want to delete the asset ' + asset.label, [
                asset.label
            ])
        );
        if (!confirm) return;

        deleteAsset(asset)
            .then(() => {
                if (asset.id === selectedAsset?.id) {
                    setSelectedAsset(null);
                }
                refetchAssets().then(() => {
                    Notify.ok(translate('action.deleteAsset.success', 'The asset has been deleted'));
                });
            })
            .catch(({ message }) => {
                Notify.error(translate('action.deleteAsset.error', 'Error while trying to delete the asset'), message);
            });
    };

    // Update currentPage if asset count changes
    useEffect(() => {
        if (!isLoading && (currentPage - 1) * ASSETS_PER_PAGE > assetData.assetCount) {
            setCurrentPage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assetData.assetCount, isLoading]);

    // Handle selection mode for the secondary Neos UI inspector
    useEffect(() => {
        if (!onAssetSelection || !selectedAsset) {
            return;
        }
        if (selectedAsset.localId) {
            onAssetSelection(selectedAsset.localId);
        } else {
            importAsset(selectedAsset, false).then(({ data }) => {
                onAssetSelection(data.importAsset.localId);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAsset]);

    useEffect(() => {
        setSelectedAssetSource(assetData.assetSources.find(assetSource => assetSource.id === assetSourceFilter));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assetData.assetSources, assetSourceFilter]);

    if (error) {
        console.error(error);
        return <p>{error.message}</p>;
    }

    return (
        <>
            <MediaUiContext.Provider
                value={{
                    assetCollectionFilter,
                    containerRef,
                    currentPage,
                    dummyImage,
                    handleDeleteAsset,
                    isLoading,
                    mediaTypeFilter,
                    refetchAssets,
                    searchTerm,
                    endpoints,
                    selectionMode,
                    setAssetCollectionFilter,
                    setCurrentPage,
                    setMediaTypeFilter,
                    setSearchTerm,
                    setTagFilter,
                    tagFilter,
                    ...assetData
                }}
            >
                {children}
            </MediaUiContext.Provider>
        </>
    );
}
