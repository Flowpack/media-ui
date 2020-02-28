import { useMediaUi } from '../core/MediaUi';
import * as React from 'react';
import { createUseStyles } from 'react-jss';
import { useIntl } from '../core/Intl';
import { MediaUITheme, useMediaUITheme } from './App';

const useListStyles = createUseStyles((theme: MediaUITheme) => ({
    container: {
        gridArea: props => props.gridPosition
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat( auto-fit, minmax(200px, 1fr) )',
        gridGap: '1rem',
        '& figure': {
            border: '1px solid gray',
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            '& picture': {
                borderBottom: `1px solid ${theme.borderColor}`
            },
            '& figcaption': {
                padding: '.5rem .8rem'
            },
            '& img': {
                height: '250px',
                width: '100%',
                objectFit: 'contain'
            }
        }
    }
}));

export default function AssetList({ gridPosition }) {
    const theme = useMediaUITheme();
    const classes = useListStyles({ gridPosition, theme });
    const { assetProxies, dummyImage } = useMediaUi();
    const { translate } = useIntl();

    return (
        <section className={classes.container}>
            <h1>{translate('assetList.header', 'Asset list')}</h1>
            <div className={classes.list}>
                {assetProxies.map(asset => {
                    const { identifier, label } = asset;
                    return (
                        <figure key={identifier}>
                            <picture>
                                <img src={asset.thumbnailUri || dummyImage} alt={asset.label} />
                            </picture>
                            <figcaption>{label}</figcaption>
                        </figure>
                    );
                })}
            </div>
        </section>
    );
}
