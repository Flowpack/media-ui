type ImageType = 'Image';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Image extends GraphQlEntity {
    __typename: ImageType;
    width: number;
    height: number;
    url: string;
    alt?: string;
}
