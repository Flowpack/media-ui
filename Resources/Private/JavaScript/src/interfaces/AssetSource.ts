export default interface AssetSource {
    readonly label: string;
    readonly identifier: string;
    readonly readOnly: boolean;
    readonly supportsTagging: boolean;
    readonly supportsCollections: boolean;
}
