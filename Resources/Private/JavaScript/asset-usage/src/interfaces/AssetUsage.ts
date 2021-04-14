import { GraphQlEntity } from '@media-ui/core/src/interfaces';

type AssetType = 'AssetUsage';

export default interface AssetUsage extends GraphQlEntity {
    __typename: AssetType;
    assetId: string;
    serviceId: string;
    label: string;
    metadata?: Record<string, any>;
}
