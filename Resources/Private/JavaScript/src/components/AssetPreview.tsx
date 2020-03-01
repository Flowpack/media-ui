import * as React from 'react';
import { createUseStyles } from 'react-jss';
import { useMediaUiTheme } from '../core/MediaUiThemeProvider';
import { useMediaUi } from '../core/MediaUi';

const useStyles = createUseStyles({
    preview: ({ gridPosition, theme }) => ({
        gridArea: gridPosition
    })
});

export default function AssetPreview(props: GridComponentProps) {
    const theme = useMediaUiTheme();
    const classes = useStyles({ ...props, theme });
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
