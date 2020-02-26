import { useMediaUi } from '../core/MediaUi';
import * as React from 'react';
import { createUseStyles } from 'react-jss';

const useListStyles = createUseStyles({
    list: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridGap: '1rem'
    }
});

export default function AssetList() {
    const classes = useListStyles();
    const { assets } = useMediaUi();

    return (
        <section>
            <h1>Asset list</h1>
            <div className={classes.list}>
                {assets.map(asset => {
                    const { identifier, label } = asset;
                    return <div key={identifier}>{label}</div>;
                })}
            </div>
        </section>
    );
}
