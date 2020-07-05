import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { Asset, MediaUiTheme } from '../../interfaces';
import { createUseMediaUiStyles, useMediaUi } from '../../core';
import { humanFileSize } from '../../helper';
import { AssetActions } from './index';
import { AssetLabel } from '../Presentation';
import { selectedAssetForPreviewState, selectedAssetState } from '../../state';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    listViewItem: {
        cursor: 'pointer',
        backgroundColor: theme.colors.mainBackground,
        '&:nth-of-type(2n)': {
            backgroundColor: theme.colors.alternatingBackground
        },
        '&:hover': {
            backgroundColor: theme.colors.primary
        }
    },
    selected: {
        backgroundColor: theme.colors.primary,
        '&:nth-of-type(2n)': {
            backgroundColor: theme.colors.primary
        }
    },
    textColumn: {
        padding: `0 ${theme.spacing.half}`,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        '& > *': {
            verticalAlign: 'middle'
        }
    },
    previewColumn: {
        minWidth: theme.spacing.goldenUnit,
        width: theme.spacing.goldenUnit,
        '& picture': {
            display: 'block',
            width: '100%',
            height: theme.spacing.goldenUnit,
            '& img': {
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'contain'
            }
        }
    },
    labelColumn: {
        extend: 'textColumn',
        userSelect: 'text',
        '& > *': {
            width: '200px'
        }
    },
    lastModifiedColumn: {
        extend: 'textColumn'
    },
    fileSizeColumn: {
        extend: 'textColumn'
    },
    mediaTypeColumn: {
        extend: 'textColumn'
    },
    actionsColumn: {
        display: 'flex',
        justifyContent: 'flex-end'
    }
}));

interface ListViewItemProps {
    asset: Asset;
}

const dateFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
};

const ListViewItem: React.FC<ListViewItemProps> = ({ asset }: ListViewItemProps) => {
    const classes = useStyles();
    const { dummyImage } = useMediaUi();
    const [selectedAsset, setSelectedAsset] = useRecoilState(selectedAssetState);
    const setSelectedAssetForPreview = useSetRecoilState(selectedAssetForPreviewState);
    const { label, thumbnailUrl, file, lastModified } = asset;

    const onSelect = useCallback(
        () => (selectedAsset?.id === asset.id ? setSelectedAssetForPreview(asset) : setSelectedAsset(asset)),
        [selectedAsset?.id, setSelectedAsset, setSelectedAssetForPreview, asset]
    );

    return (
        <tr
            onClick={onSelect}
            className={[classes.listViewItem, selectedAsset?.id === asset.id ? classes.selected : ''].join(' ')}
        >
            <td className={classes.previewColumn}>
                <picture>
                    <img src={thumbnailUrl || dummyImage} alt={label} width={40} height={36} />
                </picture>
            </td>
            <td className={classes.labelColumn}>
                <AssetLabel label={label} />
            </td>
            <td className={classes.lastModifiedColumn}>
                {new Date(lastModified).toLocaleString([], dateFormatOptions)}
            </td>
            <td className={classes.fileSizeColumn}>{humanFileSize(file.size)}</td>
            <td className={classes.mediaTypeColumn}>{file.mediaType}</td>
            <td className={classes.actionsColumn}>
                <AssetActions asset={asset} />
            </td>
        </tr>
    );
};

export default React.memo(ListViewItem);
