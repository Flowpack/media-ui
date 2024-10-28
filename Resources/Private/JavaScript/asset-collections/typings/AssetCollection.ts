type AssetCollectionType = 'AssetCollection';

type AssetCollectionId = string;

interface AssetCollection extends GraphQlEntity {
    __typename: AssetCollectionType;
    readonly id: AssetCollectionId;
    readonly title: string;
    parent: {
        readonly id: string;
        readonly title: string;
    } | null;
    tags?: Tag[];
    assetCount: number;
    path?: string;
    canDelete: boolean;
}
