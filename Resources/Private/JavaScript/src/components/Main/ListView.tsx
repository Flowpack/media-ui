import * as React from 'react';

import { createUseMediaUiStyles, useIntl } from '../../core';
import { MediaUiTheme } from '../../interfaces';
import { ListViewItem } from './index';
import { useRecoilValue } from 'recoil';
import { loadingState } from '../../state';
import { useAssetQuery } from '../../hooks';

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
                    padding: 0
                }
            }
        }
    }
}));

export default function ListView() {
    const classes = useStyles();
    const { translate } = useIntl();
    const { assets } = useAssetQuery();
    const isLoading = useRecoilValue(loadingState);

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
                <div>
                    {isLoading
                        ? translate('assetList.loading', 'Loading assets')
                        : translate('assetList.empty', 'No assets found')}
                </div>
            )}
        </section>
    );
}
