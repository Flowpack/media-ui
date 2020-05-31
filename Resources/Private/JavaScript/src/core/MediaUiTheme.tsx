import * as React from 'react';
import { createTheming, createUseStyles } from 'react-jss';
import { MediaUiTheme } from '../interfaces';
import { config } from '@neos-project/build-essentials/src/styles/styleConstants';

const ThemeContext = React.createContext({} as MediaUiTheme);
const theming = createTheming(ThemeContext);
const { ThemeProvider, useTheme } = theming;

// Extend theme config from Neos.Ui package
const mediaUiTheme: MediaUiTheme = {
    spacing: config.spacing,
    fontSize: config.fontSize,
    colors: config.colors,
    transition: config.transition,
    primaryColor: config.colors.primaryBlue,
    mainBackgroundColor: config.colors.contrastNeutral,
    alternatingBackgroundColor: config.colors.contrastDark,
    borderColor: config.colors.contrastDark,
    inactiveColor: config.colors.contrastBright,
    generatedColor: config.colors.success,
    warningColor: config.colors.warn,
    deletedColor: config.colors.error,
    assetBackgroundColor: config.colors.contrastDarkest,
    captionBackgroundColor: config.colors.contrastNeutral,
    moduleBackgroundColor: config.colors.contrastDarker,
    loadingIndicatorZIndex: 10024,
    paginationZIndex: 10022,
    lightboxZIndex: 10023
};

export const useMediaUiTheme = useTheme;

export const createUseMediaUiStyles = styles => createUseStyles(styles, { theming } as object);

export function MediaUiThemeProvider({ children }: { children: React.ReactElement }) {
    return <ThemeProvider theme={mediaUiTheme}>{children}</ThemeProvider>;
}
