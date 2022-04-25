import GraphQlEntity from './GraphQLEntity';

type TagType = 'Tag';

export default interface Tag extends GraphQlEntity {
    __typename: TagType;
    id: string;
    label: string;
}
