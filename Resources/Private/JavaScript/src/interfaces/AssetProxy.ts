import { AssetSource, IptcMetadata, Asset, FileTypeIcon } from './index';

export default interface AssetProxy {
    readonly id: string;
    imported: boolean;
    assetSource: AssetSource;
    label: string;
    caption: string;
    mediaType: string;
    fileTypeIcon: FileTypeIcon;
    filename: string;
    lastModified: Date;
    fileSize?: number;
    widthInPixels?: number;
    heightInPixels?: number;
    thumbnailUri?: string;
    previewUri?: string;
    iptcMetadata: IptcMetadata[];
    localAssetData?: Asset;
}
