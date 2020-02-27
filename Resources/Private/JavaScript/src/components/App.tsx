import * as React from 'react';
import AssetList from './AssetList';
import { createUseStyles } from 'react-jss';
import SideBarLeft from './SideBarLeft';
import SideBarRight from './SideBarRight';

const useAppStyles = createUseStyles({
    container: {
        display: 'grid',
        gridTemplateColumns: '250px 1fr 250px',
        gridGap: '1rem'
    }
});

export default function App() {
    const classes = useAppStyles();

    return (
        <div className={classes.container}>
            <SideBarLeft />
            <AssetList />
            <SideBarRight />
        </div>
    );
}
