export default interface MediaUiTheme {
    spacing: {
        goldenUnit: string;
        full: string;
        half: string;
        quarter: string;
    };
    fontSize: {
        large: string;
        base: string;
        small: string;
    };
    size: {
        sidebarWidth: string;
        scrollbarSize: string;
    };
    colors: {
        success: string;
        warn: string;
        error: string;
        primary: string;
        text: string;
        mainBackground: string;
        alternatingBackground: string;
        border: string;
        inactive: string;
        generated: string;
        warning: string;
        deleted: string;
        disabled: string;
        moduleBackground: string;
        assetBackground: string;
        captionBackground: string;
        scrollbarBackground: string;
        scrollbarForeground: string;
    };
    transition: {
        fast: string;
        default: string;
        slow: string;
    };
    paginationZIndex: number;
    loadingIndicatorZIndex: number;
    lightboxZIndex: number;
}
