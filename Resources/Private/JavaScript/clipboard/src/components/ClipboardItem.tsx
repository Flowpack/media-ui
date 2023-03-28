import * as React from 'react';
import { useCallback } from 'react';

import { useIntl, useMediaUi, useNotify } from '@media-ui/core/src';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useAssetQuery, useSelectAsset } from '@media-ui/core/src/hooks';

import classes from './ClipboardItem.module.css';

interface ClipboardItemProps {
    assetIdentity: AssetIdentity;
}

const ClipboardItem: React.FC<ClipboardItemProps> = ({ assetIdentity }: ClipboardItemProps) => {
    const { asset } = useAssetQuery(assetIdentity);
    const { dummyImage } = useMediaUi();
    const Notify = useNotify();
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
        <button type="button" onClick={onClick} className={classes.clipboardItem} title={asset?.label}>
            <img
                src={asset?.thumbnailUrl || dummyImage}
                alt={asset?.label || assetIdentity.assetId}
                width={40}
                height={36}
            />
        </button>
    );
};

export default React.memo(ClipboardItem);
