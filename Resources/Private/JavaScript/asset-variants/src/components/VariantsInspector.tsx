import React from 'react';

import { createUseMediaUiStyles, MediaUiTheme, useIntl } from '@media-ui/core';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import useAssetVariants from '../hooks/useAssetVariants';
import Variant from './Variant';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    variantsContainer: {
        padding: `${theme.spacing.full} ${theme.spacing.half}`,
        '& h1': {
            fontSize: theme.fontSize.base,
            margin: 0,
            padding: 0,
        },
    },
    variantItem: {
        marginTop: theme.spacing.full,
    },
}));

const VariantsInspector = () => {
    const { translate } = useIntl();
    const selectedAsset = useSelectedAsset();
    const result = useAssetVariants(
        selectedAsset ? { assetId: selectedAsset.id, assetSourceId: selectedAsset.assetSource.id } : null
    );
    const classes = useStyles();

    if (!selectedAsset) return null;

    return (
        <div className={classes.variantsContainer}>
            {result.loading ? (
                <div>Loading Variants</div>
            ) : (
                <>
                    <h1>Image Variants</h1>
                    <ul>
                        {result.variants?.length > 0 ? (
                            result.variants?.map((variant) => (
                                <li className={classes.variantItem} key={`variant-${variant.id}`}>
                                    <Variant {...variant} />
                                </li>
                            ))
                        ) : (
                            <li>{translate('assetVariants.noVariantsFound', 'No variants found')}</li>
                        )}
                    </ul>
                </>
            )}
        </div>
    );
};

export default VariantsInspector;
