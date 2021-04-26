import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useIntl, createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { Asset, AssetIdentity } from '@media-ui/core/src/interfaces';
import { useAssetQuery, useSelectAsset } from '@media-ui/core/src/hooks';
import { selectedAssetIdState } from '@media-ui/core/src/state';

import { AssetActions } from './index';
import { AssetLabel } from '../Presentation';
import { selectedAssetForPreviewState } from '../../state';
import MissingAssetActions from './MissingAssetActions';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    thumbnail: {
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover $caption': {
            backgroundColor: theme.colors.primary,
        },
        '&:hover $toolBar': {
            pointerEvents: 'all',
            backgroundColor: 'rgba(0.15, 0.15, 0.15, 0.25)',
            '& button': {
                opacity: 1,
                '&[disabled]': {
                    opacity: 0.5,
                },
                '&.button--active': {
                    '& svg': {
                        color: 'white',
                    },
                },
            },
        },
    },
    picture: {
        cursor: 'pointer',
        backgroundColor: theme.colors.assetBackground,
        '& img': {
            display: 'block',
            height: '250px',
            width: '100%',
            objectFit: 'contain',
        },
    },
    caption: {
        backgroundColor: theme.colors.captionBackground,
        transition: `background-color ${theme.transition.fast}`,
        padding: theme.spacing.half,
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        '& img': {
            width: '1.3rem',
            height: 'auto',
            marginRight: theme.spacing.half,
        },
    },
    selected: {
        backgroundColor: theme.colors.primary,
    },
    toolBar: {
        display: 'flex',
        position: 'absolute',
        top: theme.spacing.quarter,
        right: theme.spacing.quarter,
        pointerEvents: 'none',
        backgroundColor: 'transparent',
        transition: 'background-color .1s ease-in',
        '& button, & button[disabled]': {
            transition: 'opacity .1s ease-in',
            opacity: 0,
            '&.button--active': {
                opacity: 1,
                '& svg': {
                    color: theme.colors.primary,
                },
            },
        },
    },
    label: {
        position: 'absolute',
        top: theme.spacing.quarter,
        left: theme.spacing.quarter,
        fontSize: theme.fontSize.small,
        borderRadius: '3px',
        padding: '2px 4px',
        userSelect: 'none',
    },
}));

interface ThumbnailProps {
    assetIdentity: AssetIdentity;
    onSelect: (asset: Asset) => void;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ assetIdentity, onSelect }: ThumbnailProps) => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { dummyImage } = useMediaUi();
    const { asset, loading } = useAssetQuery(assetIdentity);
    const selectedAssetId = useRecoilValue(selectedAssetIdState);
    const isSelected = selectedAssetId?.assetId === assetIdentity.assetId;

    return (
        <figure className={classes.thumbnail}>
            {asset?.imported && <span className={classes.label}>{translate('asset.label.imported', 'Imported')}</span>}
            <picture onClick={() => onSelect(asset)} className={classes.picture}>
                <img src={loading || !asset ? dummyImage : asset.thumbnailUrl} alt={asset?.label} />
            </picture>
            <figcaption className={[classes.caption, isSelected ? classes.selected : ''].join(' ')}>
                {asset && (
                    <>
                        <img src={asset.file.typeIcon.url} alt={asset.file.typeIcon.alt} />
                        <AssetLabel label={asset.label} />
                    </>
                )}
            </figcaption>
            <div className={classes.toolBar}>
                {!loading &&
                    (asset ? <AssetActions asset={asset} /> : <MissingAssetActions assetIdentity={assetIdentity} />)}
            </div>
        </figure>
    );
};

export default React.memo(Thumbnail, (prev, next) => prev.assetIdentity.assetId === next.assetIdentity.assetId);
