type ImageType = 'Image';

interface Image extends GraphQlEntity {
    __typename: ImageType;
    width: number;
    height: number;
    url: string;
    alt?: string;
}
