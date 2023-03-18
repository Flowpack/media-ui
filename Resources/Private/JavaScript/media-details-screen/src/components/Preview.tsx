import React from 'react';
import cx from 'classnames';

import { useIntl, createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { Asset } from '@media-ui/core/src/interfaces';

import PreviewActions from './PreviewActions';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    preview: {
        minWidth: theme.size.sidebarWidth,
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    loading: {
        opacity: 0.1,
        '& img': {
            width: '100%',
        },
    },
    picture: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.assetBackground,
        aspectRatio: '16 / 9',

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
        backgroundColor: 'rgba(0.15, 0.15, 0.15, 0.25)',
        transition: 'background-color .1s ease-in',
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

interface PreviewProps {
    asset: null | Asset;
    loading: boolean;
    buildLinkToMediaUi: (asset: Asset) => string;
}

const Preview: React.FC<PreviewProps> = ({ asset, loading, buildLinkToMediaUi }: PreviewProps) => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { dummyImage } = useMediaUi();

    return (
        <figure className={cx(classes.preview, loading && classes.loading)} title={asset?.label}>
            {asset?.imported && <span className={classes.label}>{translate('asset.label.imported', 'Imported')}</span>}
            <picture className={classes.picture}>
                <img src={loading || !asset ? dummyImage : asset.previewUrl} alt={asset?.label} />
                <div className={classes.toolBar}>
                    {!loading && asset && <PreviewActions asset={asset} buildLinkToMediaUi={buildLinkToMediaUi} />}
                </div>
            </picture>
        </figure>
    );
};

export default React.memo(Preview, (prev, next) => prev.asset?.id === next.asset?.id);
