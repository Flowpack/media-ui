import * as React from 'react';

import AssetProxy from './AssetProxy';
import AssetCollection from './AssetCollection';
import Tag from './Tag';
import AssetSource from './AssetSource';
import AssetType from './AssetType';

export default interface MediaUiProviderValues {
    isLoading: boolean;
    assetCount: number;
    assetProxies: AssetProxy[];
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
    selectedAsset: AssetProxy;
    setSelectedAsset: (assetProxy: AssetProxy) => void;
    selectedAssetForPreview: AssetProxy;
    setSelectedAssetForPreview: (assetProxy: AssetProxy) => void;
    assetTypes: AssetType[];
    assetTypeFilter: AssetType;
    setAssetTypeFilter: (assetType: AssetType) => void;
    dummyImage: string;
    selectionMode: boolean;
    containerRef: React.ElementRef<any>;
}
