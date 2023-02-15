import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import selectedVariantIdState from '../state/selectedVariantIdState';
import assetVariantModalState from '../state/assetVariantModalState';

const useSelectVariant = () => {
    const setSelectedVariantId = useSetRecoilState(selectedVariantIdState);
    const setAssetVariantModalState = useSetRecoilState(assetVariantModalState);

    return useCallback(
        (variantId: string) => {
            if (!variantId) return;
            setSelectedVariantId(variantId);
            setAssetVariantModalState(true);
        },
        [setSelectedVariantId, setAssetVariantModalState]
    );
};
export default useSelectVariant;
