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
}
