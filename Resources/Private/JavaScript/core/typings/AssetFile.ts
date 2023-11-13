type AssetFileType = 'AssetFile';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AssetFile extends GraphQlEntity {
    __typename: AssetFileType;
    extension: string;
    mediaType: MediaType;
    typeIcon: Image;
    size?: number;
    url: string;
}
