import { AssetSource, IptcProperty, Tag, AssetCollection, AssetFile } from './index';
import GraphQlEntity from './GraphQLEntity';

type AssetType = 'Asset';

export default interface Asset extends GraphQlEntity {
    __typename: AssetType;
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
