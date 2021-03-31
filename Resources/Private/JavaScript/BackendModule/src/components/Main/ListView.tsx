import * as React from 'react';

import { createUseMediaUiStyles, useIntl, useMediaUi } from '../../core';
import { MediaUiTheme } from '../../interfaces';
import { ListViewItem } from './index';
import LoadingLabel from '../LoadingLabel';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    listView: {
        overflow: 'scroll',
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
    },
}));

const ListView: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { assets } = useMediaUi();

    return (
        <section className={classes.listView}>
            {assets.length ? (
                <table>
                    <thead>
                        <tr>
                            <th />
                            <th>{translate('thumbnailView.header.name', 'Name')}</th>
                            <th>{translate('thumbnailView.header.lastModified', 'Last Modified')}</th>
                            <th>{translate('thumbnailView.header.fileSize', 'File size')}</th>
                            <th>{translate('thumbnailView.header.mediaType', 'Type')}</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset, index) => (
                            <ListViewItem key={index} asset={asset} />
                        ))}
                    </tbody>
                </table>
            ) : (
                <LoadingLabel
                    loadingText={translate('assetList.loading', 'Loading assets')}
                    emptyText={translate('assetList.empty', 'No assets found')}
                />
            )}
        </section>
    );
};

export default React.memo(ListView);
