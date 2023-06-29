type AssetFileType = 'AssetFile';

interface AssetFile extends GraphQlEntity {
    __typename: AssetFileType;
    extension: string;
    mediaType: MediaType;
    typeIcon: Image;
    size?: number;
    url: string;
}
