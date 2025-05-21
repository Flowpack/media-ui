import React from 'react';

import { useMediaUi } from '@media-ui/core';

import classes from './SimilarAsset.module.css';

interface SimilarAssetProps {
    asset: Asset;
}

const SimilarAsset: React.FC<SimilarAssetProps> = ({ asset }: SimilarAssetProps) => {
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
