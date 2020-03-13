export default interface AssetSource {
    readonly label: string;
    readonly identifier: string;
    readonly description: string;
    readonly iconUri: string;
    readonly readOnly: boolean;
    readonly supportsTagging: boolean;
    readonly supportsCollections: boolean;
}
