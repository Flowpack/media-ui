import * as React from 'react';
import Lightbox from 'react-image-lightbox';

import { useMediaUi, useMediaUiTheme } from '../core';

import 'react-image-lightbox/style.css';

export default function AssetPreview() {
    const theme = useMediaUiTheme();
    const { selectedAssetForPreview, setSelectedAssetForPreview, containerRef } = useMediaUi();

    return (
        <Lightbox
            reactModalStyle={{ overlay: { zIndex: theme.lightboxZIndex } }}
            reactModalProps={{ parentSelector: () => containerRef.current }}
            mainSrc={selectedAssetForPreview.previewUri}
            onCloseRequest={() => setSelectedAssetForPreview(null)}
        />
    );
}
