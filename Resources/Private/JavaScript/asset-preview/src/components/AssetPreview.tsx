import React, { useMemo } from 'react';
import Lightbox from 'react-image-lightbox';
import { useRecoilState, useRecoilValue } from 'recoil';

import 'react-image-lightbox/style.css';

import { useMediaUi } from '@media-ui/core';
import { availableAssetsState } from '@media-ui/core/src/state';
import { useAssetQuery } from '@media-ui/core/src/hooks';

import selectedAssetForPreviewState from '../state/selectedAssetForPreviewState';

import classes from './AssetPreview.module.css';

const useLightBoxContainer = (defaultContainer: null | Element = null) => {
    const lightBoxContainerRef = React.useRef<null | Element>(defaultContainer);

    React.useEffect(() => {
        if (defaultContainer === null) {
            const newLightBoxContainer = document.createElement('div');
            newLightBoxContainer.setAttribute('data-ignore_click_outside', 'true');

            document.body.appendChild(newLightBoxContainer);
            lightBoxContainerRef.current = newLightBoxContainer;

            return () => newLightBoxContainer.remove();
        }

        lightBoxContainerRef.current = defaultContainer;
    }, [defaultContainer]);

    return lightBoxContainerRef;
};

export default function AssetPreview() {
    const { containerRef, isInNodeCreationDialog } = useMediaUi();
    const assets = useRecoilValue(availableAssetsState);
    const [selectedAssetForPreview, setSelectedAssetForPreview] = useRecoilState(selectedAssetForPreviewState);
    const { asset } = useAssetQuery(selectedAssetForPreview);
    const lightBoxContainer = useLightBoxContainer(isInNodeCreationDialog ? null : containerRef.current);

    const [prevAsset, nextAsset] = useMemo(() => {
        if (!asset) return [null, null];
        const currentAssetIndex = assets.findIndex(({ id }) => id === asset.id);
        return [
            currentAssetIndex > 0 ? assets[currentAssetIndex - 1] : null,
            currentAssetIndex < assets.length - 1 ? assets[currentAssetIndex + 1] : null,
        ];
    }, [assets, asset]);

    // TODO: Handle pdf fields with pdf viewer https://github.com/Flowpack/media-ui/issues/29

    if (!asset) return null;

    return (
        <Lightbox
            reactModalStyle={{ overlay: { zIndex: 'var(--theme-zIndex-lightbox)' } }}
            reactModalProps={{ parentSelector: () => lightBoxContainer.current }}
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
