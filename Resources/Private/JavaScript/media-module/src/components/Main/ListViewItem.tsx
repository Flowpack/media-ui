import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useAssetQuery } from '@media-ui/core/src/hooks';
import { selectedAssetIdState } from '@media-ui/core/src/state';

import { humanFileSize } from '../../helper';
import { AssetActions } from './index';
import { AssetLabel } from '../Presentation';
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
            '& img': {
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
            },
        },
    },
    labelColumn: {
        extend: 'textColumn',
        userSelect: 'text',
        '& > *': {
            width: '200px',
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
    },
    actionsColumn: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
}));

const dateFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
};

interface ListViewItemProps {
    assetIdentity: AssetIdentity;
    onSelect: (assetIdentity: AssetIdentity, openPreview: boolean) => void;
}

const ListViewItem: React.FC<ListViewItemProps> = ({ assetIdentity, onSelect }: ListViewItemProps) => {
    const classes = useStyles();
    const { dummyImage } = useMediaUi();
    const { asset, loading } = useAssetQuery(assetIdentity);
    const [selectedAssetId] = useRecoilState(selectedAssetIdState);
    const isSelected = selectedAssetId?.assetId === assetIdentity.assetId;

    const onSelectItem = useCallback(() => onSelect(assetIdentity, isSelected), [onSelect, assetIdentity, isSelected]);

    return (
        <tr className={[classes.listViewItem, isSelected ? classes.selected : ''].join(' ')}>
            <td className={classes.previewColumn} onClick={onSelectItem}>
                <picture>
                    <img src={asset?.thumbnailUrl || dummyImage} alt={asset?.label} width={40} height={36} />
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
            <td className={classes.mediaTypeColumn} onClick={onSelectItem}>
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
