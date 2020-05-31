import { AssetSource, IptcProperty, Image, Tag, AssetCollection } from './index';

export default interface Asset {
    readonly id: string;
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

    file: {
        extension: string;
        mediaType: string;
        typeIcon: Image;
        size?: number;
    };
    thumbnailUrl?: string;
    previewUrl?: string;
}
