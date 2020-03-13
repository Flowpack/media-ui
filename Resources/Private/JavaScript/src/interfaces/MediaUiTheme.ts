export default interface MediaUiTheme {
    spacing: {
        goldenUnit: string;
        full: string;
        half: string;
        quarter: string;
    };
    fontSize: {
        base: string;
        small: string;
    };
    colors: {
        primaryViolet: string;
        primaryVioletHover: string;
        primaryBlue: string;
        primaryBlueHover: string;
        contrastDarkest: string;
        contrastDarker: string;
        contrastDark: string;
        contrastNeutral: string;
        contrastBright: string;
        contrastBrighter: string;
        contrastBrightest: string;
        success: string;
        successHover: string;
        warn: string;
        warnHover: string;
        error: string;
        errorHover: string;
        uncheckedCheckboxTick: string;
    };
    transition: {
        fast: string;
        default: string;
        slow: string;
    };
    primaryColor: string;
    mainBackgroundColor: string;
    alternatingBackgroundColor: string;
    borderColor: string;
    inactiveColor: string;
    generatedColor: string;
    warningColor: string;
    deletedColor: string;
    moduleBackgroundColor: string;
    assetBackgroundColor: string;
    captionBackgroundColor: string;
    paginationZIndex: number;
    loadingIndicatorZIndex: number;
    lightboxZIndex: number;
}
