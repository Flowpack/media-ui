import * as React from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import { useMediaUi, useMediaUiTheme } from '../core';

export default function AssetPreview() {
    const theme = useMediaUiTheme();
    const { selectedAssetForPreview, setSelectedAssetForPreview, containerRef } = useMediaUi();

    return (
        <Lightbox
            reactModalStyle={{ overlay: { zIndex: theme.lightboxZIndex } }}
            reactModalProps={{ parentSelector: () => containerRef.current }}
            mainSrc={selectedAssetForPreview.previewUrl}
            onCloseRequest={() => setSelectedAssetForPreview(null)}
        />
    );
}
