import * as React from 'react';
import { createTheming } from 'react-jss';
import MediaUiTheme from '../interfaces/MediaUiTheme';

const ThemeContext = React.createContext({} as MediaUiTheme);
const theming = createTheming(ThemeContext);
const { ThemeProvider, useTheme } = theming;

const mediaUiTheme: MediaUiTheme = {
    primaryColor: '#00b5ff',
    alternatingBackgroundColor: '#3f3f3f',
    borderColor: '#3f3f3f',
    inactiveColor: '#9e9e9e',
    generatedColor: '#2e8b57',
    newColor: '#00a338',
    modifiedColor: '#adff2f',
    warningColor: '#ff4500',
    deletedColor: '#ff8700',
    moduleBackgroundColor: '#222222',
    loadingIndicatorZIndex: 10022
};

export const useMediaUiTheme = useTheme;

export default function MediaUiThemeProvider({ children }: { children: React.ReactElement }) {
    return <ThemeProvider theme={mediaUiTheme}>{children}</ThemeProvider>;
}
