import React, { useMemo } from 'react';
import { selectorFamily, useRecoilValue } from 'recoil';
import cx from 'classnames';

import { Icon } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi } from '@media-ui/core';
import { useAssetQuery } from '@media-ui/core/src/hooks';
import { selectedAssetIdState } from '@media-ui/core/src/state';
import { AssetLabel } from '@media-ui/core/src/components';

import { AssetActions } from './index';
import MissingAssetActions from './MissingAssetActions';

import classes from './Thumbnail.module.css';

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
    const { translate } = useIntl();
    const { dummyImage, isAssetSelectable, selectionMode } = useMediaUi();
    const { asset, loading } = useAssetQuery(assetIdentity);
    const isSelected = useRecoilValue(thumbnailSelectionState(assetIdentity.assetId));
    const canBeSelected = useMemo(() => isAssetSelectable(asset), [asset, isAssetSelectable]);

    return (
        <figure className={cx(classes.thumbnail, !canBeSelected && classes.disabled)} title={asset?.label}>
            {asset?.imported && <span className={classes.label}>{translate('asset.label.imported', 'Imported')}</span>}
            <picture onClick={() => onSelect(assetIdentity, isSelected && !selectionMode)} className={classes.picture}>
                <img src={loading || !asset ? dummyImage : asset.thumbnailUrl} alt={asset?.label} />
            </picture>
            <figcaption className={cx(classes.caption, isSelected && classes.selected)}>
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
