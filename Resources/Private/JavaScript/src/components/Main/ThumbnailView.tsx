import * as React from 'react';

import { IconButton } from '@neos-project/react-ui-components';

import { useMediaUi, useIntl, createUseMediaUiStyles } from '../../core';
import { MediaUiTheme, GridComponentProps } from '../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    thumbnailView: {
        gridArea: props => props.gridPosition,
        overflow: 'scroll',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gridGap: '1rem',
        '& figure': {
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            '&:hover': {
                outline: `4px solid ${theme.primaryColor}`
            },
            '& picture': {
                cursor: 'pointer',
                backgroundColor: theme.assetBackgroundColor
            },
            '&:hover $toolBar': {
                display: 'block'
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
    },
    toolBar: {
        display: 'none',
        position: 'absolute',
        top: '5px',
        right: '5px',
        '& button': {
            alignContent: 'center',
            justifyContent: 'center',
            display: 'flex'
        }
    },
    selected: {
        outline: `4px solid ${theme.primaryColor}`
    }
}));

export default function ThumbnailView(props: GridComponentProps) {
    const classes = useStyles({ ...props });
    const { assetProxies, dummyImage, selectedAsset, setSelectedAsset, setSelectedAssetForPreview } = useMediaUi();
    const { translate } = useIntl();

    return (
        <section className={classes.thumbnailView}>
            {assetProxies.length ? (
                assetProxies.map(asset => {
                    const { identifier, label } = asset;
                    return (
                        <figure key={identifier} className={selectedAsset === asset ? classes.selected : null}>
                            <picture onClick={() => setSelectedAsset(asset)}>
                                <img src={asset.thumbnailUri || dummyImage} alt={asset.label} />
                            </picture>
                            <figcaption>
                                <img src={asset.fileTypeIcon.src} alt={asset.fileTypeIcon.alt} /> {label}
                            </figcaption>
                            <div className={classes.toolBar}>
                                <IconButton
                                    className={classes.previewButton}
                                    icon="expand-alt"
                                    size="small"
                                    style="clean"
                                    hoverStyle="brand"
                                    onClick={() => setSelectedAssetForPreview(asset)}
                                />
                            </div>
                        </figure>
                    );
                })
            ) : (
                <div>{translate('assetList', 'No assets found')}</div>
            )}
        </section>
    );
}
