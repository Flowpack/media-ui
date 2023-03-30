import { AssetCollection } from '@media-ui/feature-asset-collections';
import { Tag } from '@media-ui/feature-asset-tags';
import { AssetSource } from '@media-ui/feature-asset-sources';

import IptcProperty from './IptcProperty';
import AssetFile from './AssetFile';

type AssetType = 'Asset';

export default interface Asset extends GraphQlEntity {
    __typename: AssetType;
    readonly id: string;
    readonly localId?: string;
    assetSource: AssetSource;
    imported: boolean;

    // usage will only be queried if fast usage calculation is supported by the backend
    isInUse?: boolean;

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
