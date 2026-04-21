type AssetSourceType = 'AssetSource';

type AssetSourceId = string;

interface AssetSource extends GraphQlEntity {
    __typename: AssetSourceType;
    readonly id: AssetSourceId;
    readonly label: string;
    readonly description: string;
    readonly iconUri: string;
    readonly readOnly: boolean;
    readonly supportsTagging: boolean;
    readonly supportsCollections: boolean;
}
