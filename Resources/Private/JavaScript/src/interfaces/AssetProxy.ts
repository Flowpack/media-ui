export default interface AssetProxy {
    readonly identifier: string;
    label: string;
    mediaType: string;
    filename: string;
    lastModified: Date;
    fileSize?: number;
    widthInPixels?: number;
    heightInPixels?: number;
    thumbnailUri?: string;
    previewUri?: string;
}