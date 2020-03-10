import * as React from 'react';
import Lightbox from 'react-image-lightbox';
import { useMediaUi, useMediaUiTheme } from '../core';

import 'react-image-lightbox/style.css';

export default function AssetPreview() {
    const theme = useMediaUiTheme();
    const { selectedAssetForPreview, setSelectedAssetForPreview } = useMediaUi();

    return (
        <Lightbox
            reactModalStyle={{ overlay: { zIndex: theme.lightboxZIndex } }}
            mainSrc={selectedAssetForPreview.previewUri}
            onCloseRequest={() => setSelectedAssetForPreview(null)}
        />
    );
}
