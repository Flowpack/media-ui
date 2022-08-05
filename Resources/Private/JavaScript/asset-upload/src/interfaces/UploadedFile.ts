export default interface UploadedFile extends File {
    path?: string;
    preview?: string;
    lastModified: number;
    lastModifiedDate?: Date;
    name: string;
    size: number;
    type: string;
}
