import { Tag } from '@media-ui/feature-asset-tags';

type AssetCollectionType = 'AssetCollection';

export default interface AssetCollection extends GraphQlEntity {
    __typename: AssetCollectionType;
    readonly id: string;
    readonly title: string;
    parent: {
        readonly id: string;
        readonly title: string;
    } | null;
    children: {
        readonly id: string;
        readonly title: string;
    }[];
    tags?: Tag[];
}
