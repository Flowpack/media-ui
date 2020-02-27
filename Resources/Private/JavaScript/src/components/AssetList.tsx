import { useMediaUi } from '../core/MediaUi';
import * as React from 'react';
import { createUseStyles } from 'react-jss';
import { useIntl } from '../core/Intl';

const useListStyles = createUseStyles({
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat( auto-fit, minmax(200px, 1fr) )',
        gridGap: '1rem',
        '& figure': {
            border: '1px solid gray',
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            '& figcaption': {
                padding: '.3rem'
            },
            '& img': {
                width: '100%',
                height: 'auto',
                objectFit: 'cover'
            }
        }
    }
});

export default function AssetList() {
    const classes = useListStyles();
    const { assets, dummyImage } = useMediaUi();
    const { translate } = useIntl();

    return (
        <section>
            <h1>{translate('assetList.header', 'Asset list')}</h1>
            <div className={classes.list}>
                {assets.map(asset => {
                    const { identifier, title, label } = asset;
                    return (
                        <figure key={identifier}>
                            <picture>
                                <img
                                    src={asset.thumbnail ? asset.thumbnail : dummyImage}
                                    alt={asset.caption ? asset.caption : asset.label}
                                />
                            </picture>
                            <figcaption>{title ? title : label}</figcaption>
                        </figure>
                    );
                })}
            </div>
        </section>
    );
}
