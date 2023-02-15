import { useRecoilValue } from 'recoil';

import { useSelectedAsset } from '@media-ui/core/src/hooks';
import AssetVariant from '../interfaces/AssetVariant';
import selectedVariantIdState from '../state/selectedVariantIdState';
import useAssetVariants from './useAssetVariants';

export default function useSelectedAssetVariant(): AssetVariant {
    const selectedVariantId = useRecoilValue(selectedVariantIdState);
    const selectedAsset = useSelectedAsset();
    const assetVariants = useAssetVariants({ assetId: selectedAsset.id, assetSourceId: selectedAsset.assetSource.id });

    return assetVariants.variants?.find((variant) => variant.id === selectedVariantId);
}
