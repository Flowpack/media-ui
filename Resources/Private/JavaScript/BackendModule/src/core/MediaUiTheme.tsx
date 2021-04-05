import * as React from 'react';
import { createTheming, createUseStyles } from 'react-jss';
import jss from 'jss';
import jssPluginCache from 'jss-plugin-cache';

import { config } from '@neos-project/build-essentials/src/styles/styleConstants';

import { MediaUiTheme } from '../interfaces';

const ThemeContext = React.createContext({} as MediaUiTheme);
const theming = createTheming(ThemeContext);
const { ThemeProvider, useTheme } = theming;

jss.use(jssPluginCache());

// Extend theme config from Neos.Ui package
const mediaUiTheme: MediaUiTheme = {
    spacing: config.spacing,
    fontSize: {
        ...config.fontSize,
        large: '18px',
    },
    size: {
        ...config.size,
        sidebarWidth: '250px',
        scrollbarSize: '4px',
    },
    colors: {
        primary: config.colors.primaryBlue,
        text: config.colors.contrastBright,
        mainBackground: config.colors.contrastNeutral,
        alternatingBackground: config.colors.contrastDark,
        border: config.colors.contrastDark,
        inactive: config.colors.contrastBright,
        success: config.colors.success,
        warn: config.colors.warn,
        error: config.colors.error,
        generated: config.colors.success,
        warning: config.colors.warn,
        deleted: config.colors.error,
        disabled: config.colors.contrastDark,
        assetBackground: config.colors.contrastDarkest,
        captionBackground: config.colors.contrastNeutral,
        moduleBackground: config.colors.contrastDarker,
        scrollbarBackground: 'transparent',
        scrollbarForeground: config.colors.contrastBright,
    },
    transition: config.transition,
    loadingIndicatorZIndex: 10024,
    paginationZIndex: 10022,
    lightboxZIndex: 10023,
};

export const useMediaUiTheme = useTheme;

export const createUseMediaUiStyles = (styles) =>
    createUseStyles<string, Record<string, any>, MediaUiTheme>(styles, { theming });

export function MediaUiThemeProvider({ children }: { children: React.ReactElement }) {
    return <ThemeProvider theme={mediaUiTheme}>{children}</ThemeProvider>;
}
