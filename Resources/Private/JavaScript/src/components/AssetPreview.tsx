import * as React from 'react';
import { createUseMediaUiStyles } from '../core/MediaUiThemeProvider';
import { useMediaUi } from '../core/MediaUi';
import MediaUiTheme from '../interfaces/MediaUiTheme';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    preview: {
        gridArea: props => props.gridPosition
    }
}));

export default function AssetPreview(props: GridComponentProps) {
    const classes = useStyles({ props });
    const { selectedAsset, setSelectedAsset } = useMediaUi();

    return (
        <section className={classes.preview}>
            Asset Preview for {selectedAsset.label}
            <a onClick={() => setSelectedAsset(null)}>Close preview</a>
            <figure>
                <picture>
                    <img src={selectedAsset.previewUri} alt={selectedAsset.label} />
                </picture>
            </figure>
        </section>
    );
}
