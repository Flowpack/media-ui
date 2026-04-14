type AssetCollectionParentType = 'AssetCollectionParent';

interface AssetCollectionParent extends GraphQlEntity {
    __typename: AssetCollectionParentType;
    readonly id: AssetCollectionId;
    readonly title: string;
}
