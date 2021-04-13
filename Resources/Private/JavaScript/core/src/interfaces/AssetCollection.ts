import GraphQlEntity from './GraphQLEntity';
import Tag from './Tag';

type AssetCollectionType = 'AssetCollection';

export default interface AssetCollection extends GraphQlEntity {
    __typename: AssetCollectionType;
    readonly id: string;
    readonly title: string;
    tags?: Tag[];
}
