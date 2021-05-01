import * as React from 'react';
import Lightbox from 'react-image-lightbox';
import { useRecoilState } from 'recoil';
import 'react-image-lightbox/style.css';

import { createUseMediaUiStyles, useMediaUi, useMediaUiTheme } from '@media-ui/core/src';

import selectedAssetForPreviewState from '../state/selectedAssetForPreviewState';
import { useAssetQuery } from '@media-ui/core/src/hooks';
import { useMemo } from 'react';

const useStyles = createUseMediaUiStyles({
    lightbox: {
        '& .ril__image': {
            maxWidth: '100%',
        },
    },
});

export default function AssetPreview() {
    const classes = useStyles();
    const theme = useMediaUiTheme();
    const { containerRef, assets } = useMediaUi();
    const [selectedAssetForPreview, setSelectedAssetForPreview] = useRecoilState(selectedAssetForPreviewState);
    const { asset } = useAssetQuery(selectedAssetForPreview);

    const [prevAsset, nextAsset] = useMemo(() => {
        if (!asset) return [null, null];
        const currentAssetIndex = assets.findIndex(({ id }) => id === asset.id);
        return [
            currentAssetIndex > 0 ? assets[currentAssetIndex - 1] : null,
            currentAssetIndex < assets.length - 1 ? assets[currentAssetIndex + 1] : null,
        ];
    }, [assets, asset]);

    // TODO: Handle pdf fiels with pdf viewer https://github.com/Flowpack/media-ui/issues/29

    if (!asset) return null;

    return (
        <Lightbox
            reactModalStyle={{ overlay: { zIndex: theme.lightboxZIndex } }}
            reactModalProps={{ parentSelector: () => containerRef.current }}
            wrapperClassName={classes.lightbox}
            mainSrc={asset.previewUrl}
            mainSrcThumbnail={asset.thumbnailUrl}
            imageTitle={asset.label}
            imageCaption={asset.caption}
            onCloseRequest={() => setSelectedAssetForPreview(null)}
            prevSrc={prevAsset?.previewUrl}
            prevSrcThumbnail={prevAsset?.thumbnailUrl}
            prevLabel={prevAsset?.label}
            onMovePrevRequest={() =>
                setSelectedAssetForPreview(
                    prevAsset ? { assetId: prevAsset.id, assetSourceId: prevAsset.assetSource.id } : null
                )
            }
            nextSrc={nextAsset?.previewUrl}
            nextSrcThumbnail={nextAsset?.thumbnailUrl}
            nextLabel={nextAsset?.label}
            onMoveNextRequest={() =>
                setSelectedAssetForPreview(
                    nextAsset ? { assetId: nextAsset.id, assetSourceId: nextAsset.assetSource.id } : null
                )
            }
        />
    );
}
