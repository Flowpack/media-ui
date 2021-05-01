import * as React from 'react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useSelectAsset } from '@media-ui/core/src/hooks';
import { selectedAssetForPreviewState } from '@media-ui/feature-asset-preview/src';

import { ListViewItem } from './index';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    listView: {
        overflowY: 'scroll',
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

interface ListViewProps {
    assetIdentities: AssetIdentity[];
}

const ListView: React.FC<ListViewProps> = ({ assetIdentities }: ListViewProps) => {
    const classes = useStyles();
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
                        <th />
                        <th>{translate('thumbnailView.header.name', 'Name')}</th>
                        <th>{translate('thumbnailView.header.lastModified', 'Last Modified')}</th>
                        <th>{translate('thumbnailView.header.fileSize', 'File size')}</th>
                        <th>{translate('thumbnailView.header.mediaType', 'Type')}</th>
                        <th />
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
