type AssetCollectionType = 'AssetCollection';

type AssetCollectionId = string;
type AssetCollectionTitle = string;
type AssetCollectionPath = string;

interface AssetCollection extends GraphQlEntity {
    __typename: AssetCollectionType;
    readonly id: AssetCollectionId;
    readonly assetSourceId: AssetSourceId;
    readonly title: AssetCollectionTitle;
    parent?: AssetCollectionParent;
    tags?: Tag[];
    assetCount: number;
    path?: AssetCollectionPath;
    canDelete: boolean;
}
