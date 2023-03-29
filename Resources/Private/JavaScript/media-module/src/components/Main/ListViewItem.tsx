import React, { useCallback, useMemo } from 'react';
import { selectorFamily, useRecoilValue } from 'recoil';
import cx from 'classnames';

import { Icon } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useAssetQuery } from '@media-ui/core/src/hooks';
import { selectedAssetIdState } from '@media-ui/core/src/state';
import { humanFileSize } from '@media-ui/core/src/helper';
import { AssetLabel } from '@media-ui/core/src/components';

import { AssetActions } from './index';
import MissingAssetActions from './MissingAssetActions';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    listViewItem: {
        backgroundColor: theme.colors.mainBackground,
        '&:nth-of-type(2n)': {
            backgroundColor: theme.colors.alternatingBackground,
        },
        '&:hover': {
            backgroundColor: theme.colors.primary,
        },
    },
    selected: {
        backgroundColor: theme.colors.primary,
        '&:nth-of-type(2n)': {
            backgroundColor: theme.colors.primary,
        },
    },
    textColumn: {
        padding: `0 ${theme.spacing.half}`,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        cursor: 'pointer',
        width: '1px',
        '& > *': {
            verticalAlign: 'middle',
        },
    },
    previewColumn: {
        minWidth: theme.spacing.goldenUnit,
        width: theme.spacing.goldenUnit,
        cursor: 'pointer',
        '& picture': {
            display: 'block',
            width: '100%',
            height: theme.spacing.goldenUnit,
            textAlign: 'center',
            '& img, & svg': {
                display: 'inline-block',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
            },
        },
    },
    labelColumn: {
        extend: 'textColumn',
        display: 'table',
        tableLayout: 'fixed',
        width: '100%',
        lineHeight: theme.spacing.goldenUnit,
        userSelect: 'text',
        '& > *': {
            width: `calc(100% - 2 * ${theme.spacing.half})`,
            padding: `0 ${theme.spacing.half}`,
        },
    },
    lastModifiedColumn: {
        extend: 'textColumn',
    },
    fileSizeColumn: {
        extend: 'textColumn',
    },
    mediaTypeColumn: {
        extend: 'textColumn',
        maxWidth: '100px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    actionsColumn: {
        extend: 'textColumn',
        textAlign: 'right',
    },
}));

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
    const classes = useStyles();
    const { dummyImage, isAssetSelectable } = useMediaUi();
    const { asset, loading } = useAssetQuery(assetIdentity);
    const isSelected = useRecoilValue(listViewItemSelectionState(assetIdentity.assetId));
    const canBeSelected = useMemo(() => isAssetSelectable(asset), [asset, isAssetSelectable]);
    const onSelectItem = useCallback(() => onSelect(assetIdentity, isSelected), [onSelect, assetIdentity, isSelected]);

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
