import useAssetVariants from '../hooks/useAssetVariants';
import React from 'react';
import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { useSelectedAsset } from '@media-ui/core/src/hooks';
import Variant from './Variant';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    variantsContainer: {
        padding: `${theme.spacing.full} ${theme.spacing.half}`,
    },
    variantItem: {
        marginTop: theme.spacing.full,
    },
}));

const VariantsInspector = () => {
    const selectedAsset = useSelectedAsset();
    const result = useAssetVariants({ assetId: selectedAsset.id, assetSourceId: selectedAsset.assetSource.id });
    const classes = useStyles();

    return (
        <div className={classes.variantsContainer}>
            {result.loading ? (
                <div>Loading Variants</div>
            ) : (
                <>
                    <h1>Image Variants</h1>
                    <ul>
                        {result?.variants?.map((variant) => (
                            <li className={classes.variantItem} key={`variant-${variant.id}`}>
                                <Variant {...variant} />
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default VariantsInspector;
