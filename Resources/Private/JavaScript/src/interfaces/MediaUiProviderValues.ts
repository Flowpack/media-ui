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
    setTagFilter: Function;
    assetSources;
    assetSourceFilter: AssetSource;
    setAssetSourceFilter: Function;
    assetCollections: AssetCollection[];
    assetCollectionFilter: AssetCollection;
    setAssetCollectionFilter: Function;
    currentPage: number;
    setCurrentPage: Function;
    dummyImage: string;
}
