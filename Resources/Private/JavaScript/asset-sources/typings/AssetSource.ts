type AssetSourceType = 'AssetSource';

type AssetSourceId = string;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
