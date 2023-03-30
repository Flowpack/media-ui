const ASSET_IDENTIFIER_PATTERN = /id:([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})/;

export class SearchTerm {
    private readonly assetIdentifier: undefined | null | string = undefined;

    private constructor(private readonly value: string) {
        const matches = ASSET_IDENTIFIER_PATTERN.exec(this.value);
        if (matches && matches[1]) {
            this.assetIdentifier = matches[1];
        } else {
            this.assetIdentifier = null;
        }
    }

    public static fromString(string: string): SearchTerm {
        return new SearchTerm(string);
    }

    public static fromUrl(url: URL): SearchTerm {
        const string = url.searchParams.get('searchTerm') ?? '';

        return SearchTerm.fromString(string);
    }

    public readonly getAssetIdentifierIfPresent = (): null | AssetIdentity => {
        return this.assetIdentifier
            ? {
                  assetId: this.assetIdentifier,
                  assetSourceId: '',
              }
            : null;
    };

    public readonly toString = (): string => {
        return this.value;
    };
}
