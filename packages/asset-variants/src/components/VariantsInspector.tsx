import React from 'react';

import { useIntl } from '@media-ui/core';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import useAssetVariants from '../hooks/useAssetVariants';
import Variant from './Variant';

import classes from './VariantsInspector.module.css';

const VariantsInspector = () => {
    const { translate } = useIntl();
    const selectedAsset = useSelectedAsset();
    const result = useAssetVariants(
        selectedAsset ? { assetId: selectedAsset.id, assetSourceId: selectedAsset.assetSource.id } : null
    );
    if (!selectedAsset) return null;

    return (
        <div className={classes.variantsContainer}>
            {result.loading ? (
                <div>{translate('assetVariants.loadingVariants', 'Loading Variants…')}</div>
            ) : (
                <>
                    <h1>{translate('assetVariants.title', 'Image Variants')}</h1>
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
