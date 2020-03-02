import * as React from 'react';
import { createUseStyles } from 'react-jss';
import { useMediaUi } from '../core/MediaUi';
import { useMediaUiTheme } from '../core/MediaUiThemeProvider';
import { useIntl } from '../core/Intl';

const useListStyles = createUseStyles({
    assetList: ({ gridPosition, theme }) => ({
        '.neos &': {
            gridArea: gridPosition,
            display: 'grid',
            gridTemplateColumns: 'repeat( auto-fit, minmax(200px, 1fr) )',
            gridGap: '1rem',
            '& figure': {
                margin: '0',
                display: 'flex',
                flexDirection: 'column',
                '& picture': {
                    cursor: 'pointer',
                    backgroundColor: theme.assetBackgroundColor,
                    '&:hover': {
                        outline: `4px solid ${theme.primaryColor}`,
                        zIndex: 2
                    }
                },
                '& figcaption': {
                    backgroundColor: theme.captionBackgroundColor,
                    padding: '.8rem .8rem',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    '& img': {
                        width: '1.3rem',
                        height: 'auto',
                        marginRight: '.5rem'
                    }
                },
                '& img': {
                    height: '250px',
                    width: '100%',
                    objectFit: 'contain'
                }
            }
        }
    })
});

export default function AssetList(props: GridComponentProps) {
    const theme = useMediaUiTheme();
    const classes = useListStyles({ ...props, theme });
    const { assetProxies, dummyImage, setSelectedAsset } = useMediaUi();
    const { translate } = useIntl();

    return (
        <section className={classes.assetList}>
            {assetProxies.length ? (
                assetProxies.map(asset => {
                    const { identifier, label } = asset;
                    return (
                        <figure key={identifier}>
                            <picture onClick={() => setSelectedAsset(asset)}>
                                <img src={asset.thumbnailUri || dummyImage} alt={asset.label} />
                            </picture>
                            <figcaption>
                                <img src={asset.fileTypeIcon.src} alt={asset.fileTypeIcon.alt} /> {label}
                            </figcaption>
                        </figure>
                    );
                })
            ) : (
                <div>{translate('assetList', 'No assets found')}</div>
            )}
        </section>
    );
}
