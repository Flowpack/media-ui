import * as React from 'react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useIntl, createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core';
import { useSelectAsset } from '@media-ui/core/src/hooks';
import { selectedAssetForPreviewState } from '@media-ui/feature-asset-preview';

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
            <table>
                <thead>
                    <tr>
                        <th className={classes.tableHeader} />
                        <th className={classes.tableHeader}>{translate('thumbnailView.header.name', 'Name')}</th>
                        <th className={classes.tableHeader}>
                            {translate('thumbnailView.header.lastModified', 'Last Modified')}
                        </th>
                        <th className={classes.tableHeader}>
                            {translate('thumbnailView.header.fileSize', 'File size')}
                        </th>
                        <th className={classes.tableHeader}>{translate('thumbnailView.header.mediaType', 'Type')}</th>
                        <th className={classes.tableHeader} />
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
