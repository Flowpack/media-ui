import * as React from 'react';
import { useCallback } from 'react';

import { useIntl, createUseMediaUiStyles, MediaUiTheme, useMediaUi, useNotify } from '@media-ui/core/src';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useAssetQuery, useSelectAsset } from '@media-ui/core/src/hooks';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    clipboardItem: {
        cursor: 'pointer',
        minWidth: theme.spacing.goldenUnit,
        width: theme.spacing.goldenUnit,
        height: theme.spacing.goldenUnit,
        '& img': {
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
        },
    },
}));

interface ClipboardItemProps {
    assetIdentity: AssetIdentity;
}

const ClipboardItem: React.FC<ClipboardItemProps> = ({ assetIdentity }: ClipboardItemProps) => {
    const { asset } = useAssetQuery(assetIdentity);
    const { dummyImage } = useMediaUi();
    const Notify = useNotify();
    const classes = useStyles();
    const selectAsset = useSelectAsset();
    const { translate } = useIntl();

    const onClick = useCallback(() => {
        if (assetIdentity) {
            selectAsset(assetIdentity);
        } else {
            Notify.warning(translate('clipboard.assetNotLoaded', "Cannot select asset as it couldn't be loaded"));
        }
    }, [assetIdentity, selectAsset, Notify, translate]);

    return (
        <span onClick={onClick} className={classes.clipboardItem} title={asset?.isInClipboard + ''}>
            <img
                src={asset?.thumbnailUrl || dummyImage}
                alt={asset?.label || assetIdentity.assetId}
                width={40}
                height={36}
            />
        </span>
    );
};

export default React.memo(ClipboardItem);
