import AssetProxy from './AssetProxy';
import AssetCollection from './AssetCollection';
import Tag from './Tag';
import AssetSource from './AssetSource';

export default interface MediaUiProviderValues {
    csrf: string;
    endpoints: any;
    notify: Function;
    isLoading: boolean;
    assetCount: number;
    assetProxies: AssetProxy[];
    tags: Tag[];
    tagFilter: Tag;
    setTagFilter: (tag: Tag) => void;
    assetSources;
    assetSourceFilter: AssetSource;
    setAssetSourceFilter: (assetSource: AssetSource) => void;
    assetCollections: AssetCollection[];
    assetCollectionFilter: AssetCollection;
    setAssetCollectionFilter: (assetCollection: AssetCollection) => void;
    currentPage: number;
    setCurrentPage: (currentPage: number) => void;
    selectedAsset: AssetProxy;
    setSelectedAsset: (assetProxy: AssetProxy) => void;
    dummyImage: string;
}
