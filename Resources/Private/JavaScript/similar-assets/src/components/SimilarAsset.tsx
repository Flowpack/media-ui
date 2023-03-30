import * as React from 'react';

import { Asset } from '@media-ui/core/src/interfaces';
import { createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    similarAsset: {
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    picture: {
        backgroundColor: theme.colors.assetBackground,
        '& img': {
            display: 'block',
            height: '250px',
            width: '100%',
            objectFit: 'contain',
        },
    },
    caption: {
        backgroundColor: theme.colors.captionBackground,
        transition: `background-color ${theme.transition.fast}`,
        padding: theme.spacing.half,
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        '& img': {
            width: '1.3rem',
            height: 'auto',
            marginRight: theme.spacing.half,
        },
    },
}));

interface SimilarAssetProps {
    asset: Asset;
}

const SimilarAsset: React.FC<SimilarAssetProps> = ({ asset }: SimilarAssetProps) => {
    const classes = useStyles();
    const { dummyImage } = useMediaUi();

    return (
        <figure className={classes.similarAsset}>
            <picture className={classes.picture}>
                <img src={!asset ? dummyImage : asset.thumbnailUrl} alt={asset?.label} />
            </picture>
            <figcaption className={classes.caption}>
                {asset && (
                    <>
                        <img src={asset.file.typeIcon.url} alt={asset.file.typeIcon.alt} />
                        <span>{asset.label}</span>
                    </>
                )}
            </figcaption>
        </figure>
    );
};

export default React.memo(SimilarAsset);
