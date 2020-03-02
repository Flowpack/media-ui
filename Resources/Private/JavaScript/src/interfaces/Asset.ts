import Tag from './Tag';
import AssetCollection from './AssetCollection';

export default interface Asset {
    readonly identifier: string;
    title?: string;
    label: string;
    caption?: string;
    mediaType: string;
    fileExtension: string;
    filename: string;
    copyrightNotice?: string;
    thumbnail: string;
    tags: Tag[];
    assetCollections: AssetCollection[];
}
