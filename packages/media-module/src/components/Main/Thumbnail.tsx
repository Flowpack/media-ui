import React, { useCallback, useMemo } from 'react';
import { selectorFamily, useRecoilValue } from 'recoil';
import cx from 'classnames';

import { Icon } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi } from '@media-ui/core';
import { useAssetQuery } from '@media-ui/core/src/hooks';
import { selectedAssetIdState, isAssetSelectedState } from '@media-ui/core/src/state';
import { AssetLabel } from '@media-ui/core/src/components';

import { AssetActions } from './index';
import MissingAssetActions from './MissingAssetActions';

import classes from './Thumbnail.module.css';

interface ThumbnailProps {
    assetIdentity: AssetIdentity;
    onSelect: (assetIdentity: AssetIdentity, openPreview: boolean) => void;
    onMultiSelect: (assetIdentity: AssetIdentity, event: React.MouseEvent) => void;
}

const thumbnailSelectionState = selectorFamily<boolean, string>({
    key: 'ThumbnailSelection',
    get:
        (assetId) =>
        ({ get }) => {
            return get(selectedAssetIdState)?.assetId === assetId;
        },
});

const Thumbnail: React.FC<ThumbnailProps> = ({ assetIdentity, onSelect, onMultiSelect }: ThumbnailProps) => {
    const { translate } = useIntl();
    const { dummyImage, isAssetSelectable, selectionMode } = useMediaUi();
    const { asset, loading } = useAssetQuery(assetIdentity);
    const isSelected = useRecoilValue(thumbnailSelectionState(assetIdentity.assetId));
    const isMultiSelected = useRecoilValue(isAssetSelectedState(assetIdentity.assetId));
    const canBeSelected = useMemo(() => isAssetSelectable(asset), [asset, isAssetSelectable]);

    const handlePictureClick = useCallback(
        (event: React.MouseEvent) => {
            if (event.ctrlKey || event.metaKey || event.shiftKey) {
                onMultiSelect(assetIdentity, event);
            } else {
                onSelect(assetIdentity, isSelected && !selectionMode);
            }
        },
        [assetIdentity, isSelected, selectionMode, onSelect, onMultiSelect]
    );

    const handleCheckboxClick = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();
            onMultiSelect(assetIdentity, event);
        },
        [assetIdentity, onMultiSelect]
    );

    return (
        <figure
            className={cx(
                classes.thumbnail,
                !canBeSelected && classes.disabled,
                isMultiSelected && classes.multiSelected
            )}
            title={asset?.label}
        >
            {asset?.imported && <span className={classes.label}>{translate('asset.label.imported', 'Imported')}</span>}
            <input
                type="checkbox"
                className={classes.checkbox}
                checked={isMultiSelected}
                readOnly
                onClick={handleCheckboxClick}
                title={translate('thumbnail.multiSelect', 'Toggle selection')}
            />
            <picture onClick={handlePictureClick} className={classes.picture}>
                <img src={loading || !asset ? dummyImage : asset.thumbnailUrl} alt={asset?.label} />
            </picture>
            <figcaption className={classes.caption}>
                {asset && (
                    <>
                        {!canBeSelected && !asset.file && (
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
