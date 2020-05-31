export default interface Tag {
    label: string;
    parent?: Tag;
    children: Tag[];
}
