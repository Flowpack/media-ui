export default interface FeatureFlags {
    createAssetRedirectsOption: boolean;
    limitToSingleAssetCollectionPerAsset: boolean;
    pagination: PaginationConfig;
    pollForChanges: boolean;
    propertyEditor: {
        collapsed: boolean;
    };
    queryAssetUsage: boolean;
    showSimilarAssets: boolean;
    showVariantsEditor: boolean;
    useNewMediaSelection: boolean;
}
