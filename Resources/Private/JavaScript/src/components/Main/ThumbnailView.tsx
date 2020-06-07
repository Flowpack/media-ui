import * as React from 'react';

import { useMediaUi, useIntl, createUseMediaUiStyles } from '../../core';
import { MediaUiTheme, GridComponentProps } from '../../interfaces';
import { Thumbnail } from './index';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    thumbnailView: {
        gridArea: props => props.gridPosition,
        overflow: 'scroll',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gridGap: '1rem'
    }
}));

export default function ThumbnailView(props: GridComponentProps) {
    const classes = useStyles({ ...props });
    const { assets, selectedAsset, setSelectedAsset, setSelectedAssetForPreview } = useMediaUi();
    const { translate } = useIntl();

    return (
        <section className={classes.thumbnailView}>
            {assets.length ? (
                assets.map(asset => (
                    <Thumbnail
                        key={asset.id}
                        asset={asset}
                        isSelected={selectedAsset?.id === asset.id}
                        onSelect={asset => setSelectedAsset(asset)}
                        onShowPreview={asset => setSelectedAssetForPreview(asset)}
                    />
                ))
            ) : (
                <div>{translate('assetList', 'No assets found')}</div>
            )}
        </section>
    );
}
