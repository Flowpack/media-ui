import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core/src';

import { humanFileSize } from '../../helper';
import { AssetActions } from './index';
import { AssetLabel } from '../Presentation';
import { selectedAssetForPreviewState } from '../../state';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useAssetQuery, useSelectAsset } from '@media-ui/core/src/hooks';
import { selectedAssetIdState } from '@media-ui/core/src/state';

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
}

const ListViewItem: React.FC<ListViewItemProps> = ({ assetIdentity }: ListViewItemProps) => {
    const classes = useStyles();
    const { dummyImage } = useMediaUi();
    const { asset } = useAssetQuery(assetIdentity);
    const [selectedAssetId] = useRecoilState(selectedAssetIdState);
    const setSelectedAssetForPreview = useSetRecoilState(selectedAssetForPreviewState);
    const selectAsset = useSelectAsset();
    const isSelected = selectedAssetId?.assetId === assetIdentity.assetId;

    const onSelect = useCallback(() => {
        if (selectedAssetId?.assetId === asset.id) {
            setSelectedAssetForPreview(asset);
        } else {
            selectAsset(asset);
        }
    }, [selectedAssetId, asset, setSelectedAssetForPreview, selectAsset]);

    return (
        <tr className={[classes.listViewItem, isSelected ? classes.selected : ''].join(' ')}>
            <td className={classes.previewColumn} onClick={onSelect}>
                <picture>
                    <img src={asset?.thumbnailUrl || dummyImage} alt={asset?.label} width={40} height={36} />
                </picture>
            </td>
            {asset ? (
                <>
                    <td className={classes.labelColumn} onClick={onSelect}>
                        <AssetLabel label={asset.label} />
                    </td>
                    <td className={classes.lastModifiedColumn} onClick={onSelect}>
                        {new Date(asset.lastModified).toLocaleString([], dateFormatOptions)}
                    </td>
                    <td className={classes.fileSizeColumn} onClick={onSelect}>
                        {humanFileSize(asset.file.size)}
                    </td>
                    <td className={classes.mediaTypeColumn} onClick={onSelect}>
                        {asset.file.mediaType}
                    </td>
                    <td className={classes.actionsColumn}>
                        <AssetActions asset={asset} />
                    </td>
                </>
            ) : (
                <td className={classes.labelColumn} colSpan={5}>
                    Loading...
                </td>
            )}
        </tr>
    );
};

export default React.memo(ListViewItem, (prev, next) => prev.assetIdentity.assetId === next.assetIdentity.assetId);
