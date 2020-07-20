import GraphQlEntity from './GraphQLEntity';

type ImageType = 'Image';

export default interface Image extends GraphQlEntity {
    __typename: ImageType;
    width: number;
    height: number;
    url: string;
    alt?: string;
}
