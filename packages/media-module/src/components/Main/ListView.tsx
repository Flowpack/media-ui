import React from 'react';
import { useRecoilValue } from 'recoil';
import cx from 'classnames';

import { useIntl, useMediaUi } from '@media-ui/core';
import { applicationContextState } from '@media-ui/core/src/state';

import { ListViewItem } from './index';
import { useAssetSelection } from '../../hooks';

import classes from './ListView.module.css';

interface ListViewProps {
    assetIdentities: AssetIdentity[];
}

const ListView: React.FC<ListViewProps> = ({ assetIdentities }: ListViewProps) => {
    const { isInNodeCreationDialog } = useMediaUi();
    const { translate } = useIntl();
    const applicationContext = useRecoilValue(applicationContextState);
    const { onSelect, onMultiSelect } = useAssetSelection(assetIdentities);

    return (
        <section className={cx(classes.listView, isInNodeCreationDialog && classes.listViewFullHeight)}>
            <table>
                <thead>
                    <tr>
                        {applicationContext === 'browser' && <th className={classes.tableHeader} />}
                        <th className={classes.tableHeader} />
                        <th className={classes.tableHeader}>{translate('thumbnailView.header.name', 'Name')}</th>
                        <th className={classes.tableHeader}>
                            {translate('thumbnailView.header.lastModified', 'Last modified')}
                        </th>
                        <th className={classes.tableHeader}>
                            {translate('thumbnailView.header.fileSize', 'File size')}
                        </th>
                        <th className={classes.tableHeader}>{translate('thumbnailView.header.mediaType', 'Type')}</th>
                        <th className={classes.tableHeader} />
                    </tr>
                </thead>
                <tbody>
                    {assetIdentities.map((assetIdentity) => (
                        <ListViewItem
                            key={assetIdentity.assetId}
                            assetIdentity={assetIdentity}
                            onSelect={onSelect}
                            onMultiSelect={onMultiSelect}
                        />
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default React.memo(ListView);
