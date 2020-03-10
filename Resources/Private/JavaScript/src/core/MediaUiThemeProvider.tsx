import * as React from 'react';
import { createTheming, createUseStyles } from 'react-jss';
import { MediaUiTheme } from '../interfaces';

const ThemeContext = React.createContext({} as MediaUiTheme);
const theming = createTheming(ThemeContext);
const { ThemeProvider, useTheme } = theming;

// Theme config from Neos.Ui package
// TODO: Make css variables available in backend modules or include them differently
const config = {
    spacing: {
        goldenUnit: '40px',
        full: '16px',
        half: '8px',
        quarter: '4px'
    },
    size: {
        sidebarWidth: '320px'
    },
    transition: {
        fast: '.1s',
        default: '.25s',
        slow: '.5s'
    },
    zIndex: {},
    fontSize: {
        base: '14px',
        small: '12px'
    },
    fonts: {
        headings: {
            family: 'Noto Sans',
            style: 'Regular',
            cssWeight: '400'
        },
        copy: {
            family: 'Noto Sans',
            style: 'Regular',
            cssWeight: '400'
        }
    },
    colors: {
        primaryViolet: '#26224C',
        primaryVioletHover: '#342f5f',
        primaryBlue: '#00ADEE',
        primaryBlueHover: '#35c3f8',
        contrastDarkest: '#141414',
        contrastDarker: '#222',
        contrastDark: '#3f3f3f',
        contrastNeutral: '#323232',
        contrastBright: '#999',
        contrastBrighter: '#adadad',
        contrastBrightest: '#FFF',
        success: '#00a338',
        successHover: '#0bb344',
        warn: '#ff8700',
        warnHover: '#fda23d',
        error: '#ff460d',
        errorHover: '#ff6a3c',
        uncheckedCheckboxTick: '#5B5B5B'
    }
};

// TODO: Directly use css variables or use above config as theme
const mediaUiTheme: MediaUiTheme = {
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
    loadingIndicatorZIndex: 10022,
    paginationZIndex: 10022
};

export const createUseMediaUiStyles = styles => createUseStyles(styles, { theming } as object);

export default function MediaUiThemeProvider({ children }: { children: React.ReactElement }) {
    return <ThemeProvider theme={mediaUiTheme}>{children}</ThemeProvider>;
}
