import * as React from 'react';

import { IconButton } from '@neos-project/react-ui-components';

import { Asset, MediaUiTheme } from '../../interfaces';
import { createUseMediaUiStyles, useMediaUi } from '../../core';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    thumbnail: {
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
    },
    picture: {
        cursor: 'pointer',
        backgroundColor: theme.assetBackgroundColor,
        '& img': {
            height: '250px',
            width: '100%',
            objectFit: 'contain'
        }
    },
    label: {
        backgroundColor: ({ isSelected }) => (isSelected ? theme.primaryColor : theme.captionBackgroundColor),
        padding: '.8rem .8rem',
        display: 'flex',
        alignItems: 'center',
        '& img': {
            width: '1.3rem',
            height: 'auto',
            marginRight: '.5rem'
        },
        '& span': {
            display: 'inline-block',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
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
    }
}));

interface ThumbnailProps {
    asset: Asset;
    isSelected: boolean;
    onSelect: (asset: Asset) => void;
    onShowPreview: (asset: Asset) => void;
}

export default function Thumbnail({ asset, isSelected, onSelect, onShowPreview }: ThumbnailProps) {
    const classes = useStyles({ isSelected });
    const { dummyImage } = useMediaUi();
    const { label, thumbnailUrl, file } = asset;

    return (
        <figure className={classes.thumbnail}>
            <picture onClick={() => onSelect(asset)} className={classes.picture}>
                <img src={thumbnailUrl || dummyImage} alt={label} />
            </picture>
            <figcaption className={classes.label}>
                <img src={file.typeIcon.url} alt={file.typeIcon.alt} />
                <span>{label}</span>
            </figcaption>
            <div className={classes.toolBar}>
                <IconButton
                    className={classes.previewButton}
                    icon="expand-alt"
                    size="small"
                    style="clean"
                    hoverStyle="brand"
                    onClick={() => onShowPreview(asset)}
                />
            </div>
        </figure>
    );
}
