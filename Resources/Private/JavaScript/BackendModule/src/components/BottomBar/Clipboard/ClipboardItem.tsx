import * as React from 'react';
import { useCallback } from 'react';

import { AssetIdentity, MediaUiTheme } from '../../../interfaces';
import { useAssetQuery, useSelectAsset } from '../../../hooks';
import { createUseMediaUiStyles, useMediaUi } from '../../../core';

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
    const classes = useStyles();
    const selectAsset = useSelectAsset();

    const onClick = useCallback(() => {
        selectAsset(asset);
    }, [asset, selectAsset]);

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
