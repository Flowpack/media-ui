import React, { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import cx from 'classnames';

import { Icon } from '@neos-project/react-ui-components';

import { useMediaUi } from '@media-ui/core';
import { useAssetQuery } from '@media-ui/core/src/hooks';
import { isAssetSelectedState } from '@media-ui/core/src/state';
import { humanFileSize } from '@media-ui/core/src/helper';
import { AssetLabel } from '@media-ui/core/src/components';

import { AssetActions } from './index';
import MissingAssetActions from './MissingAssetActions';

import classes from './ListViewItem.module.css';

const dateFormatOptions: Record<string, DateTimeFormatOption> = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
};

interface ListViewItemProps {
    assetIdentity: AssetIdentity;
    onSelect: (assetIdentity: AssetIdentity, openPreview: boolean) => void;
    onMultiSelect: (assetIdentity: AssetIdentity, event: { shiftKey: boolean }) => void;
}

const ListViewItem: React.FC<ListViewItemProps> = ({ assetIdentity, onSelect, onMultiSelect }: ListViewItemProps) => {
    const { dummyImage, isAssetSelectable, selectionMode } = useMediaUi();
    const { asset, loading } = useAssetQuery(assetIdentity);
    const isMultiSelected = useRecoilValue(isAssetSelectedState(assetIdentity.assetId));
    const canBeSelected = useMemo(() => isAssetSelectable(asset), [asset, isAssetSelectable]);

    const handleClick = useCallback(
        (event: React.MouseEvent, openPreview: boolean) => {
            if (event.ctrlKey || event.metaKey || event.shiftKey) {
                event.preventDefault();
                onMultiSelect(assetIdentity, event);
            } else {
                onSelect(assetIdentity, openPreview);
            }
        },
        [onSelect, onMultiSelect, assetIdentity]
    );

    const handleRowClick = useCallback((event: React.MouseEvent) => handleClick(event, false), [handleClick]);

    const handlePreviewClick = useCallback(
        (event: React.MouseEvent) => handleClick(event, !selectionMode),
        [handleClick, selectionMode]
    );

    const handleCheckboxClick = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();
            // Only preventDefault for actual mouse clicks to avoid blocking keyboard Enter/Space
            if (event.detail > 0) {
                event.preventDefault();
                onMultiSelect(assetIdentity, event);
            }
        },
        [assetIdentity, onMultiSelect]
    );

    return (
        <tr className={cx(classes.listViewItem, isMultiSelected && classes.selected)}>
            <td className={classes.checkboxColumn} onClick={handleCheckboxClick}>
                <label className="neos-checkbox">
                    <input
                        type="checkbox"
                        checked={isMultiSelected}
                        onChange={() => onMultiSelect(assetIdentity, { shiftKey: false })}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onMultiSelect(assetIdentity, { shiftKey: e.shiftKey });
                            }
                        }}
                    />
                    <span></span>
                </label>
            </td>
            <td className={classes.previewColumn} onClick={handlePreviewClick}>
                <picture>
                    {canBeSelected ? (
                        <img src={asset?.thumbnailUrl || dummyImage} alt={asset?.label} width={40} height={36} />
                    ) : (
                        <Icon icon="ban" color="error" />
                    )}
                </picture>
            </td>
            <td className={classes.labelColumn} onClick={handleRowClick}>
                {asset && <AssetLabel label={asset.label} />}
            </td>
            <td className={classes.lastModifiedColumn} onClick={handleRowClick}>
                {asset && new Date(asset.lastModified).toLocaleString([], dateFormatOptions)}
            </td>
            <td className={classes.fileSizeColumn} onClick={handleRowClick}>
                {asset && humanFileSize(asset.file.size)}
            </td>
            <td className={classes.mediaTypeColumn} onClick={handleRowClick} title={asset?.file.mediaType}>
                {asset?.file.mediaType}
            </td>
            <td className={classes.actionsColumn}>
                {!loading &&
                    (asset ? <AssetActions asset={asset} /> : <MissingAssetActions assetIdentity={assetIdentity} />)}
            </td>
        </tr>
    );
};

export default React.memo(ListViewItem, (prev, next) => prev.assetIdentity.assetId === next.assetIdentity.assetId);
