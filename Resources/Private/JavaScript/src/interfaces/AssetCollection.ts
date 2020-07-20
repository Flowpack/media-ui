import { Tag } from './index';
import GraphQlEntity from './GraphQLEntity';

type AssetCollectionType = 'AssetCollection';

export default interface AssetCollection extends GraphQlEntity {
    __typename: AssetCollectionType;
    readonly title: string;
    tags?: Tag[];
}
