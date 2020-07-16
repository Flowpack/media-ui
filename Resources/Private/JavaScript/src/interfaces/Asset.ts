import { AssetSource, IptcProperty, Tag, AssetCollection, AssetFile } from './index';

export default interface Asset {
    __typename?: string;
    readonly id: string;
    readonly localId: string;
    assetSource: AssetSource;
    imported: boolean;

    label: string;
    caption: string;
    filename: string;

    tags: Tag[];
    collections: AssetCollection[];

    copyrightNotice: string;
    lastModified: Date;
    iptcProperties: IptcProperty[];

    width?: number;
    height?: number;

    file: AssetFile;
    thumbnailUrl?: string;
    previewUrl?: string;
}
