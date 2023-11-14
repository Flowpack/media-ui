type AssetCollectionType = 'AssetCollection';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AssetCollection extends GraphQlEntity {
    __typename: AssetCollectionType;
    readonly id: string;
    readonly title: string;
    parent: {
        readonly id: string;
        readonly title: string;
    } | null;
    tags?: Tag[];
    assetCount: number;
}
