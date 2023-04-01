import React, { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useSelectAsset } from '@media-ui/core/src/hooks';
import { selectedAssetForPreviewState } from '@media-ui/feature-asset-preview';

import { Thumbnail } from './index';

import classes from './ThumbnailView.module.css';

interface ThumbnailViewProps {
    assetIdentities: AssetIdentity[];
}

const ThumbnailView: React.FC<ThumbnailViewProps> = ({ assetIdentities }: ThumbnailViewProps) => {
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
        <section className={classes.thumbnailView}>
            {assetIdentities.map((assetIdentity, index) => (
                <Thumbnail key={index} assetIdentity={assetIdentity} onSelect={onSelect} />
            ))}
        </section>
    );
};

export default React.memo(ThumbnailView);
