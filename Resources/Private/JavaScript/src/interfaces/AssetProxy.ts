export default interface AssetProxy {
    identifier: string;
    label: string;
    mediaType: string;
    filename: string;
    lastModified: Date;
    fileSize: number;
    widthInPixels: number;
    heightInPixels: number;
    thumbnailUri: string;
    previewUri: string;
}
