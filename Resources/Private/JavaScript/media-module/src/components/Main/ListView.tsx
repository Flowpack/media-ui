import * as React from 'react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useIntl, createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useSelectAsset } from '@media-ui/core/src/hooks';
import { selectedAssetForPreviewState } from '@media-ui/feature-asset-preview/src';

import { ListViewItem } from './index';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    listView: ({ isInNodeCreationDialog }) => ({
        height: isInNodeCreationDialog ? '100%' : 'auto',
        '& table': {
            borderSpacing: '0 1px',
            width: '100%',
            '& th': {
                textAlign: 'left',
                lineHeight: theme.spacing.goldenUnit,
                padding: `0 ${theme.spacing.half}`,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                userSelect: 'none',
                '&:first-child, &:last-child': {
                    padding: 0,
                },
            },
        },
    }),
    tableHeader: {
        position: 'sticky',
        backgroundColor: 'var(--grayDark)',
        top: '0px',
        zIndex: '1',
    },
    table: {
        tableLayout: 'fixed',
    },
    previewColumn: {
        extend: 'tableHeader',
        width: '40px',
    },
    labelColumn: {
        extend: 'tableHeader',
    },
    lastModifiedColumn: {
        extend: 'tableHeader',
        width: '150px',
    },
    fileSizeColumn: {
        extend: 'tableHeader',
        width: '75px',
    },
    mediaTypeColumn: {
        extend: 'tableHeader',
        width: '100px',
    },
    actionsColumn: {
        extend: 'tableHeader',
        width: '160px',
    },
}));

interface ListViewProps {
    assetIdentities: AssetIdentity[];
}

const ListView: React.FC<ListViewProps> = ({ assetIdentities }: ListViewProps) => {
    const { isInNodeCreationDialog } = useMediaUi();
    const classes = useStyles({ isInNodeCreationDialog });
    const { translate } = useIntl();
    const setSelectedAssetForPreview = useSetRecoilState(selectedAssetForPreviewState);
    const selectAsset = useSelectAsset();

    const onSelect = useCallback(
        (assetIdentity: AssetIdentity, openPreview = false) => {
            if (openPreview) {
                setSelectedAssetForPreview(assetIdentity);
            } else {
                selectAsset(assetIdentity);
            }
        },
        [setSelectedAssetForPreview, selectAsset]
    );

    return (
        <section className={classes.listView}>
            <table className={classes.table}>
                <thead>
                    <tr>
                        <th className={classes.previewColumn} />
                        <th className={classes.labelColumn}>{translate('thumbnailView.header.name', 'Name')}</th>
                        <th className={classes.lastModifiedColumn}>
                            {translate('thumbnailView.header.lastModified', 'Last Modified')}
                        </th>
                        <th className={classes.fileSizeColumn}>
                            {translate('thumbnailView.header.fileSize', 'File size')}
                        </th>
                        <th className={classes.mediaTypeColumn}>
                            {translate('thumbnailView.header.mediaType', 'Type')}
                        </th>
                        <th className={classes.actionsColumn} />
                    </tr>
                </thead>
                <tbody>
                    {assetIdentities.map((assetIdentity, index) => (
                        <ListViewItem key={index} assetIdentity={assetIdentity} onSelect={onSelect} />
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default React.memo(ListView);
