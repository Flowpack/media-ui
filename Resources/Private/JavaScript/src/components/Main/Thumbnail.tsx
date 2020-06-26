import * as React from 'react';

import { Asset, MediaUiTheme } from '../../interfaces';
import { createUseMediaUiStyles, useIntl, useMediaUi } from '../../core';
import { AssetActions } from './index';
import { AssetLabel } from '../Presentation';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    thumbnail: {
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover $caption': {
            backgroundColor: theme.colors.primary
        },
        '&:hover $toolBar': {
            display: 'flex'
        }
    },
    picture: {
        cursor: 'pointer',
        backgroundColor: theme.colors.assetBackground,
        '& img': {
            display: 'block',
            height: '250px',
            width: '100%',
            objectFit: 'contain'
        }
    },
    caption: {
        backgroundColor: ({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.captionBackground),
        padding: theme.spacing.half,
        display: 'flex',
        alignItems: 'center',
        '& img': {
            width: '1.3rem',
            height: 'auto',
            marginRight: theme.spacing.quarter
        }
    },
    toolBar: {
        display: 'none',
        position: 'absolute',
        top: theme.spacing.quarter,
        right: theme.spacing.quarter,
        backgroundColor: 'rgba(0.15, 0.15, 0.15, 0.25)'
    },
    label: {
        position: 'absolute',
        top: theme.spacing.quarter,
        left: theme.spacing.quarter,
        fontSize: theme.fontSize.small,
        borderRadius: '3px',
        padding: '2px 4px',
        backgroundColor: theme.colors.primary,
        userSelect: 'none'
    }
}));

interface ThumbnailProps {
    asset: Asset;
    isSelected: boolean;
}

export default function Thumbnail({ asset, isSelected }: ThumbnailProps) {
    const classes = useStyles({ isSelected });
    const { translate } = useIntl();
    const { dummyImage, setSelectedAsset, setSelectedAssetForPreview } = useMediaUi();
    const { label, thumbnailUrl, file } = asset;

    return (
        <figure className={classes.thumbnail}>
            {asset.imported && <span className={classes.label}>{translate('asset.label.imported', 'Imported')}</span>}
            <picture
                onClick={() => (isSelected ? setSelectedAssetForPreview(asset) : setSelectedAsset(asset))}
                className={classes.picture}
            >
                <img src={thumbnailUrl || dummyImage} alt={label} />
            </picture>
            <figcaption className={classes.caption}>
                <img src={file.typeIcon.url} alt={file.typeIcon.alt} />
                <AssetLabel label={label} />
            </figcaption>
            <div className={classes.toolBar}>
                <AssetActions asset={asset} />
            </div>
        </figure>
    );
}
