type TagType = 'Tag';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Tag extends GraphQlEntity {
    __typename: TagType;
    id: string;
    label: string;
}
