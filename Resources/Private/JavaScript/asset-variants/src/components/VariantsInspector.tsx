import useAssetVariants from '../hooks/useAssetVariants';
import React from 'react';

const VariantEditor = () => {
    const result = useAssetVariants({ assetId: '0bf33a79-3ee6-cdb2-94f1-95bc46beee0b', assetSourceId: 'neos' });

    return (
        <div>
            {result?.variants?.map((variant) => (
                <div>
                    <img src={variant.previewUrl} />
                    <h3>
                        {variant.presetIdentifier} {variant.variantName}
                    </h3>
                </div>
            ))}
        </div>
    );
};

export default VariantEditor;
