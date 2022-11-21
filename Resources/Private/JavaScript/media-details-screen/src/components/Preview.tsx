import * as React from 'react';

import { useIntl, createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useAssetQuery } from '@media-ui/core/src/hooks';

import MissingAssetActions from '@media-ui/media-module/src/components/Main/MissingAssetActions';

import PreviewActions from './PreviewActions';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    preview: {
        width: `calc(100% - ${theme.size.sidebarWidth})`,
        minWidth: theme.size.sidebarWidth,
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    picture: {
        position: 'sticky',
        top: '0',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.assetBackground,
        aspectRatio: '16 / 9',

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

        '& img': {
            maxWidth: '100%',
            maxHeight: `calc(100vh - 3 * ${theme.spacing.goldenUnit} - 2 * ${theme.spacing.full})`,
            display: 'block',
            backgroundImage:
                'repeating-linear-gradient(45deg, #999999 25%, transparent 25%, transparent 75%, #999999 75%, #999999), repeating-linear-gradient(45deg, #999999 25%, #e5e5f7 25%, #e5e5f7 75%, #999999 75%, #999999)',
            backgroundPosition: '0 0, 10px 10px',
            backgroundSize: '20px 20px',
        },
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
}

const Preview: React.FC<ThumbnailProps> = ({ assetIdentity }: ThumbnailProps) => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { dummyImage } = useMediaUi();
    const { asset, loading } = useAssetQuery(assetIdentity);

    return (
        <figure className={classes.preview} title={asset?.label}>
            {asset?.imported && <span className={classes.label}>{translate('asset.label.imported', 'Imported')}</span>}
            <picture className={classes.picture}>
                <img src={loading || !asset ? dummyImage : asset.previewUrl} alt={asset?.label} />
                <div className={classes.toolBar}>
                    {!loading &&
                        (asset ? (
                            <PreviewActions asset={asset} />
                        ) : (
                            <MissingAssetActions assetIdentity={assetIdentity} />
                        ))}
                </div>
            </picture>
        </figure>
    );
};

export default React.memo(Preview, (prev, next) => prev.assetIdentity.assetId === next.assetIdentity.assetId);
