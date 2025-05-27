import React, { useCallback, useMemo } from 'react';
import { selectorFamily, useRecoilValue } from 'recoil';
import cx from 'classnames';

import { Icon } from '@neos-project/react-ui-components';

import { useMediaUi } from '@media-ui/core';
import { useAssetQuery } from '@media-ui/core/src/hooks';
import { selectedAssetIdState } from '@media-ui/core/src/state';
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
}

const listViewItemSelectionState = selectorFamily<boolean, string>({
    key: 'ListViewItemSelection',
    get:
        (assetId) =>
        ({ get }) => {
            return get(selectedAssetIdState)?.assetId === assetId;
        },
});

const ListViewItem: React.FC<ListViewItemProps> = ({ assetIdentity, onSelect }: ListViewItemProps) => {
    const { dummyImage, isAssetSelectable, selectionMode } = useMediaUi();
    const { asset, loading } = useAssetQuery(assetIdentity);
    const isSelected = useRecoilValue(listViewItemSelectionState(assetIdentity.assetId));
    const canBeSelected = useMemo(() => isAssetSelectable(asset), [asset, isAssetSelectable]);
    const onSelectItem = useCallback(
        () => onSelect(assetIdentity, isSelected && !selectionMode),
        [onSelect, assetIdentity, isSelected, selectionMode]
    );

    return (
        <tr className={cx(classes.listViewItem, isSelected && classes.selected)}>
            <td className={classes.previewColumn} onClick={onSelectItem}>
                <picture>
                    {canBeSelected ? (
                        <img src={asset?.thumbnailUrl || dummyImage} alt={asset?.label} width={40} height={36} />
                    ) : (
                        <Icon icon="ban" color="error" />
                    )}
                </picture>
            </td>
            <td className={classes.labelColumn} onClick={onSelectItem}>
                {asset && <AssetLabel label={asset.label} />}
            </td>
            <td className={classes.lastModifiedColumn} onClick={onSelectItem}>
                {asset && new Date(asset.lastModified).toLocaleString([], dateFormatOptions)}
            </td>
            <td className={classes.fileSizeColumn} onClick={onSelectItem}>
                {asset && humanFileSize(asset.file.size)}
            </td>
            <td className={classes.mediaTypeColumn} onClick={onSelectItem} title={asset?.file.mediaType}>
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
