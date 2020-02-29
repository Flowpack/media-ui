import * as React from 'react';
import AssetList from './AssetList';
import { createTheming, createUseStyles } from 'react-jss';
import SideBarLeft from './SideBarLeft';
import SideBarRight from './SideBarRight';
import Pagination from './Pagination';

const ThemeContext = React.createContext({} as MediaUITheme);
const theming = createTheming(ThemeContext);
const { ThemeProvider, useTheme } = theming;

export const useMediaUITheme = useTheme;

export interface MediaUITheme {
    primaryColor: string;
    alternatingBackgroundColor: string;
    borderColor: string;
    inactiveColor: string;
    generatedColor: string;
    newColor: string;
    modifiedColor: string;
    warningColor: string;
    deletedColor: string;
}

const mediaUITheme: MediaUITheme = {
    primaryColor: '#00b5ff',
    alternatingBackgroundColor: '#3f3f3f',
    borderColor: '#3f3f3f',
    inactiveColor: '#9e9e9e',
    generatedColor: '#2e8b57',
    newColor: '#00a338',
    modifiedColor: '#adff2f',
    warningColor: '#ff4500',
    deletedColor: '#ff8700'
};
import LoadingIndicator from './LoadingIndicator';

const useAppStyles = createUseStyles({
    container: {
        display: 'grid',
        gridTemplateColumns: '250px 1fr 250px',
        gridTemplateAreas: `
            "left main right"
            "left bottom right"
        `,
        gridGap: '1rem'
    }
});

export default function App() {
    const classes = useAppStyles();

    return (
        <ThemeProvider theme={mediaUITheme}>
            <div className={classes.container}>
                <LoadingIndicator />
                <SideBarLeft gridPosition="left" />
                <AssetList gridPosition="main" />
                <Pagination gridPosition="bottom" />
                <SideBarRight gridPosition="right" />
            </div>
        </ThemeProvider>
    );
}
