import React from 'react';
import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import AssetVariant from '../interfaces/AssetVariant';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface VariantProps extends AssetVariant {}

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    variantContainer: {
        backgroundColor: theme.colors.assetBackground,
    },
    picture: {
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'block',
        backgroundImage:
            'repeating-linear-gradient(45deg, #999999 25%, transparent 25%, transparent 75%, #999999 75%, #999999), repeating-linear-gradient(45deg, #999999 25%, #e5e5f7 25%, #e5e5f7 75%, #999999 75%, #999999)',
        backgroundPosition: '0 0, 10px 10px',
        backgroundSize: '20px 20px',
    },
    caption: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.half,
        backgroundColor: theme.colors.captionBackground,
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        maxWidth: theme.size.sidebarWidth,
    },
    info: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    variantSizes: {
        fontSize: theme.fontSize.small,
    },
}));

const Variant: React.FC<VariantProps> = ({
    presetIdentifier,
    variantName,
    width,
    height,
    previewUrl,
}: VariantProps) => {
    const classes = useStyles();
    return (
        <div className={classes.variantContainer}>
            <picture className={classes.picture}>
                <img className={classes.image} src={previewUrl} alt={variantName} />
            </picture>
            <figcaption className={classes.caption}>
                <div className={classes.infoContainer}>
                    {presetIdentifier ? <span className={classes.info}>Preset: {presetIdentifier}</span> : null}
                    {variantName ? <span className={classes.info}>Variant: {variantName}</span> : null}
                    <span className={classes.variantSizes}>
                        W: {width} H: {height}
                    </span>
                </div>
            </figcaption>
        </div>
    );
};

export default Variant;
