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
            '&:hover $label': {
                backgroundColor: theme.primaryColor
            },
            '&:hover $toolBar': {
                display: 'block'
            }
        }
    },
    thumbnail: {
        cursor: 'pointer',
        backgroundColor: theme.assetBackgroundColor,
        '& img': {
            height: '250px',
            width: '100%',
            objectFit: 'contain'
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
    label: {
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
    selected: {
        '& $label': {
            backgroundColor: theme.primaryColor
        }
    }
}));

export default function ThumbnailView(props: GridComponentProps) {
    const classes = useStyles({ ...props });
    const { assets, dummyImage, selectedAsset, setSelectedAsset, setSelectedAssetForPreview } = useMediaUi();
    const { translate } = useIntl();

    return (
        <section className={classes.thumbnailView}>
            {assets.length ? (
                assets.map(asset => {
                    const { id, label } = asset;
                    return (
                        <figure key={id} className={selectedAsset?.id === id ? classes.selected : null}>
                            <picture onClick={() => setSelectedAsset(asset)} className={classes.thumbnail}>
                                <img src={asset.thumbnailUrl || dummyImage} alt={asset.label} />
                            </picture>
                            <figcaption className={classes.label}>
                                <img src={asset.file.typeIcon.url} alt={asset.file.typeIcon.alt} /> {label}
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
