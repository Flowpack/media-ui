import React, { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import cx from 'classnames';

import { Icon } from '@neos-project/react-ui-components';

import { useMediaUi } from '@media-ui/core';
import { useAssetQuery } from '@media-ui/core/src/hooks';
import { applicationContextState, isFocusedAssetState, isAssetSelectedState } from '@media-ui/core/src/state';
import { AssetLabel, Badge } from '@media-ui/core/src/components';

import { AssetActions } from './index';
import MissingAssetActions from './MissingAssetActions';

import classes from './Thumbnail.module.css';

interface ThumbnailProps {
    assetIdentity: AssetIdentity;
    onSelect: (assetIdentity: AssetIdentity, openPreview: boolean) => void;
    onMultiSelect: (assetIdentity: AssetIdentity, event: { shiftKey: boolean }) => void;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ assetIdentity, onSelect, onMultiSelect }: ThumbnailProps) => {
    const { dummyImage, isAssetSelectable, selectionMode } = useMediaUi();
    const { asset, loading } = useAssetQuery(assetIdentity);
    const applicationContext = useRecoilValue(applicationContextState);
    const isSelected = useRecoilValue(isFocusedAssetState(assetIdentity.assetId));
    const isMultiSelected = useRecoilValue(isAssetSelectedState(assetIdentity.assetId));
    const canBeSelected = useMemo(() => isAssetSelectable(asset), [asset, isAssetSelectable]);
    const isBrowserContext = applicationContext === 'browser';

    const handlePictureClick = useCallback(
        (event: React.MouseEvent) => {
            if (isBrowserContext && (event.ctrlKey || event.metaKey || event.shiftKey)) {
                onMultiSelect(assetIdentity, event);
            } else {
                onSelect(assetIdentity, isSelected && !selectionMode);
            }
        },
        [assetIdentity, isSelected, selectionMode, isBrowserContext, onSelect, onMultiSelect]
    );

    const handleCheckboxClick = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();
            onMultiSelect(assetIdentity, event);
        },
        [assetIdentity, onMultiSelect]
    );

    return (
        <figure
            className={cx(classes.thumbnail, !canBeSelected && classes.disabled, isMultiSelected && classes.selected)}
            title={asset?.label}
        >
            {isBrowserContext && (
                <label className={cx('neos-checkbox', classes.checkbox)} onClick={handleCheckboxClick}>
                    <input type="checkbox" checked={isMultiSelected} readOnly />
                    <span></span>
                </label>
            )}
            <picture onClick={handlePictureClick} className={classes.picture}>
                <img src={loading || !asset ? dummyImage : asset.thumbnailUrl} alt={asset?.label} />
            </picture>
            <figcaption onClick={handlePictureClick} className={classes.caption}>
                {asset && (
                    <>
                        <AssetLabel label={asset.label} />
                        {canBeSelected && asset.file ? (
                            <Badge variant="inverse" className={classes.fileTypeBadge}>
                                {asset.file.extension.toUpperCase()}
                            </Badge>
                        ) : (
                            <Icon icon="ban" color="error" />
                        )}
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
