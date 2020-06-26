import * as React from 'react';

import { useMediaUi, useIntl, createUseMediaUiStyles } from '../../core';
import { MediaUiTheme } from '../../interfaces';
import { Thumbnail } from './index';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    thumbnailView: {
        overflow: 'scroll',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gridGap: theme.spacing.full
    }
}));

export default function ThumbnailView() {
    const classes = useStyles();
    const { assets, selectedAsset } = useMediaUi();
    const { translate } = useIntl();

    return (
        <section className={classes.thumbnailView}>
            {assets.length ? (
                assets.map(asset => (
                    <Thumbnail key={asset.id} asset={asset} isSelected={selectedAsset?.id === asset.id} />
                ))
            ) : (
                <div>{translate('assetList', 'No assets found')}</div>
            )}
        </section>
    );
}
