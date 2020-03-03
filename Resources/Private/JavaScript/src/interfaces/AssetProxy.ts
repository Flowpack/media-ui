import FileTypeIcon from './FileTypeIcon';
import Asset from './Asset';
import IptcMetadata from './IptcMetadata';

export default interface AssetProxy {
    readonly identifier: string;
    label: string;
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
    localAssetIdentifier?: string;
    localAssetData?: Asset;
}
