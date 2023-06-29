type AssetCollectionType = 'AssetCollection';

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
