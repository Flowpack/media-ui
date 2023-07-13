type AssetEntityType = 'Asset';

interface Asset extends GraphQlEntity {
    __typename: AssetEntityType;
    readonly id: string;
    readonly localId?: string;
    readonly assetSource: {
        readonly id: AssetSourceId;
        readonly readOnly: boolean;
    };
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
