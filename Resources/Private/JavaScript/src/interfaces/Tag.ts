export default interface Tag {
    __typename?: string;
    label: string;
    parent?: Tag;
    children: Tag[];
}
