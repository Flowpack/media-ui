import * as React from 'react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useSelectAsset } from '@media-ui/core/src/hooks';
import { selectedAssetForPreviewState } from '@media-ui/feature-asset-preview/src';

import { Thumbnail } from './index';

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
