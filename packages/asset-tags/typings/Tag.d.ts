type TagType = 'Tag';

interface Tag extends GraphQlEntity {
    __typename: TagType;
    id: string;
    label: string;
}
