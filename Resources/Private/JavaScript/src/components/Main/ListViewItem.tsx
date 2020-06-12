import * as React from 'react';

import { IconButton } from '@neos-project/react-ui-components';

import { Asset, MediaUiTheme } from '../../interfaces';
import { createUseMediaUiStyles, useMediaUi } from '../../core';
import { humanFileSize } from '../../helper';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    listViewItem: {
        cursor: 'pointer',
        backgroundColor: ({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.mainBackground),
        '&:nth-of-type(2n)': {
            backgroundColor: theme.colors.alternatingBackground
        },
        '&:hover': {
            backgroundColor: theme.colors.primary
        }
    },
    textColumn: {
        padding: `0 ${theme.spacing.half}`,
        whiteSpace: 'nowrap',
        userSelect: 'none'
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
        '& span': {
            width: '200px',
            display: 'inline-block',
            overflowX: 'hidden',
            textOverflow: 'ellipsis'
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

interface ListViewItemProos {
    asset: Asset;
    isSelected: boolean;
    onSelect: (asset: Asset) => void;
    onShowPreview: (asset: Asset) => void;
    onDelete: (asset: Asset) => void;
}

const dateFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
};

export default function ListViewItem({ asset, isSelected, onSelect, onShowPreview, onDelete }: ListViewItemProos) {
    const classes = useStyles({ isSelected });
    const { dummyImage } = useMediaUi();
    const { label, thumbnailUrl, file, lastModified } = asset;

    return (
        <tr onClick={() => onSelect(asset)} className={classes.listViewItem}>
            <td className={classes.previewColumn}>
                <picture>
                    <img src={thumbnailUrl || dummyImage} alt={label} width={40} height={36} />
                </picture>
            </td>
            <td className={classes.labelColumn}>
                <span>{label}</span>
            </td>
            <td className={classes.lastModifiedColumn}>
                {new Date(lastModified).toLocaleString([], dateFormatOptions)}
            </td>
            <td className={classes.fileSizeColumn}>{humanFileSize(file.size)}</td>
            <td className={classes.mediaTypeColumn}>{file.mediaType}</td>
            <td className={classes.actionsColumn}>
                <IconButton
                    icon="expand-alt"
                    size="regular"
                    style="transparent"
                    hoverStyle="lighter"
                    onClick={() => onShowPreview(asset)}
                />
                <IconButton
                    icon="trash"
                    size="regular"
                    style="transparent"
                    hoverStyle="error"
                    onClick={() => onDelete(asset)}
                />
            </td>
        </tr>
    );
}
