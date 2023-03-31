import React, { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import cx from 'classnames';

import { useIntl, useMediaUi } from '@media-ui/core';
import { useSelectAsset } from '@media-ui/core/src/hooks';
import { selectedAssetForPreviewState } from '@media-ui/feature-asset-preview';

import { ListViewItem } from './index';

interface ListViewProps {
    assetIdentities: AssetIdentity[];
}

import classes from './ListView.module.css';

const ListView: React.FC<ListViewProps> = ({ assetIdentities }: ListViewProps) => {
    const { isInNodeCreationDialog } = useMediaUi();
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
        <section className={cx(classes.listView, isInNodeCreationDialog && classes.listViewFullHeight)}>
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
