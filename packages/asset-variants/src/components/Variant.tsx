import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface VariantProps extends AssetVariant {}

import classes from './Variant.module.css';

const Variant: React.FC<VariantProps> = ({
    presetIdentifier,
    variantName,
    width,
    height,
    previewUrl,
}: VariantProps) => {
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
