import { useRecoilValue } from 'recoil';

import { selectedAssetIdState } from '../state';
import useAssetQuery from './useAssetQuery';

const useSelectedAsset = (): Asset => {
    const selectedAssetId = useRecoilValue(selectedAssetIdState);
    const { asset } = useAssetQuery(selectedAssetId);
    return asset;
};

export default useSelectedAsset;
