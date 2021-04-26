import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { Asset, AssetIdentity } from '@media-ui/core/src/interfaces';
import { selectedAssetIdState } from '@media-ui/core/src/state';
import { useSelectAsset } from '@media-ui/core/src/hooks';

import { Thumbnail } from './index';
import { selectedAssetForPreviewState } from '../../state';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    thumbnailView: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gridGap: theme.spacing.full,
    },
}));

interface ThumbnailViewProps {
    assetIdentities: AssetIdentity[];
}

const ThumbnailView: React.FC<ThumbnailViewProps> = ({ assetIdentities }: ThumbnailViewProps) => {
    const classes = useStyles();
    const selectedAssetId = useRecoilValue(selectedAssetIdState);
    const setSelectedAssetForPreview = useSetRecoilState(selectedAssetForPreviewState);
    const selectAsset = useSelectAsset();

    const onSelect = useCallback(
        (asset: Asset) => {
            if (asset.id === selectedAssetId?.assetId) {
                setSelectedAssetForPreview(asset);
            } else {
                selectAsset(asset);
            }
        },
        [selectedAssetId, setSelectedAssetForPreview, selectAsset]
    );

    return (
        <section className={classes.thumbnailView}>
            {assetIdentities.map((assetIdentity, index) => (
                <Thumbnail key={index} assetIdentity={assetIdentity} onSelect={onSelect} />
            ))}
        </section>
    );
};

export default React.memo(ThumbnailView);
