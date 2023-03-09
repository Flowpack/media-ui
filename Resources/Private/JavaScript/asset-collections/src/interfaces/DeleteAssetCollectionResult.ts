type DeleteAssetCollectionResultType = 'DeleteAssetCollectionResult';

export default interface DeleteAssetCollectionResult extends GraphQlEntity {
    __typename: DeleteAssetCollectionResultType;
    readonly success: boolean;
}
