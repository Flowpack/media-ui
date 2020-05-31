import * as React from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import { createUseMediaUiStyles, useMediaUi, useMediaUiTheme } from '../core';

const useStyles = createUseMediaUiStyles({
    lightbox: {
        '& .ril__image': {
            maxWidth: '100%'
        }
    }
});

export default function AssetPreview() {
    const classes = useStyles();
    const theme = useMediaUiTheme();
    const { selectedAssetForPreview, setSelectedAssetForPreview, containerRef } = useMediaUi();

    return (
        <Lightbox
            reactModalStyle={{ overlay: { zIndex: theme.lightboxZIndex } }}
            reactModalProps={{ parentSelector: () => containerRef.current }}
            wrapperClassName={classes.lightbox}
            mainSrc={selectedAssetForPreview.previewUrl}
            onCloseRequest={() => setSelectedAssetForPreview(null)}
        />
    );
}
