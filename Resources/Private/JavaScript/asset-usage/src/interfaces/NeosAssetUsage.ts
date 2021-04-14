import AssetUsage from './AssetUsage';

export default interface NeosAssetUsage extends AssetUsage {
    serviceId: 'neos';
    metadata: {
        site: string;
        uri: string;
        workspace: string;
        lastModified: Date;
        contentDimensions: string[];
    };
}
