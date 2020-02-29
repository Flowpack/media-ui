import * as React from 'react';
import { createUseStyles } from 'react-jss';
import { useMediaUi } from '../core/MediaUi';
import { useMediaUiTheme } from '../core/MediaUiThemeProvider';

const useListStyles = createUseStyles({
    container: {
        gridArea: props => props.gridPosition
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat( auto-fit, minmax(200px, 1fr) )',
        gridGap: '1rem',
        '& figure': {
            border: ({ theme }) => `1px solid ${theme.borderColor}`,
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            '& picture': {
                borderBottom: ({ theme }) =>`1px solid ${theme.borderColor}`
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
});

export default function AssetList(props: GridComponentProps) {
    const theme = useMediaUiTheme();
    const classes = useListStyles({ ...props, theme });
    const { assetProxies, dummyImage } = useMediaUi();

    return (
        <section className={classes.container}>
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
