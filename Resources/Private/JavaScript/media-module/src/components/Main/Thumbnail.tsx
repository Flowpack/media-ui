import * as React from 'react';
import { useMemo } from 'react';
import { selectorFamily, useRecoilValue } from 'recoil';

import { Icon } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useAssetQuery } from '@media-ui/core/src/hooks';
import { selectedAssetIdState } from '@media-ui/core/src/state';

import { AssetActions } from './index';
import { AssetLabel } from '../Presentation';
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
        height: '250px',
        display: 'flex',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.assetBackground,

        '& img': {
            display: 'block',
            backgroundImage:
                'repeating-linear-gradient(45deg, #999999 25%, transparent 25%, transparent 75%, #999999 75%, #999999), repeating-linear-gradient(45deg, #999999 25%, #e5e5f7 25%, #e5e5f7 75%, #999999 75%, #999999)',
            backgroundPosition: '0 0, 10px 10px',
            backgroundSize: '20px 20px',
            maxHeight: '250px',
            maxWidth: '100%',
        },
    },
    caption: {
        backgroundColor: theme.colors.captionBackground,
        transition: `background-color ${theme.transition.fast}`,
        padding: theme.spacing.half,
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        '& img, & svg': {
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
    disabled: {
        '& $picture': {
            filter: 'grayscale(1)',
            cursor: 'not-allowed',
        },
    },
}));

interface ThumbnailProps {
    assetIdentity: AssetIdentity;
    onSelect: (assetIdentity: AssetIdentity, openPreview: boolean) => void;
}

const thumbnailSelectionState = selectorFamily<boolean, string>({
    key: 'ThumbnailSelection',
    get:
        (assetId) =>
        ({ get }) => {
            return get(selectedAssetIdState)?.assetId === assetId;
        },
});

const Thumbnail: React.FC<ThumbnailProps> = ({ assetIdentity, onSelect }: ThumbnailProps) => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { dummyImage, isAssetSelectable } = useMediaUi();
    const { asset, loading } = useAssetQuery(assetIdentity);
    const isSelected = useRecoilValue(thumbnailSelectionState(assetIdentity.assetId));
    const canBeSelected = useMemo(() => isAssetSelectable(asset), [asset, isAssetSelectable]);

    return (
        <figure className={[classes.thumbnail, !canBeSelected && classes.disabled].join(' ')} title={asset?.label}>
            {asset?.imported && <span className={classes.label}>{translate('asset.label.imported', 'Imported')}</span>}
            <picture onClick={() => onSelect(assetIdentity, isSelected)} className={classes.picture}>
                <img src={loading || !asset ? dummyImage : asset.thumbnailUrl} alt={asset?.label} />
            </picture>
            <figcaption className={[classes.caption, isSelected ? classes.selected : ''].join(' ')}>
                {asset && (
                    <>
                        {canBeSelected && asset.file ? (
                            <img src={asset.file.typeIcon.url} alt={asset.file.typeIcon.alt} />
                        ) : (
                            <Icon icon="ban" color="error" />
                        )}
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
