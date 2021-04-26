import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useAssetCountQuery } from '@media-ui/core/src/hooks';
import { useUnusedAssetCountQuery } from '@media-ui/feature-asset-usage/src';

import { MainViewState, mainViewState } from '../state';

const useAssetCount = (): number => {
    const { assetCount } = useAssetCountQuery();
    const mainView = useRecoilValue(mainViewState);
    const { called: unusedAssetCountLoaded, load: loadUnusedAssetCount, unusedAssetCount } = useUnusedAssetCountQuery();

    const count = mainView === MainViewState.UNUSED_ASSETS ? unusedAssetCount : assetCount;

    useEffect(() => {
        if (mainView === MainViewState.UNUSED_ASSETS && !unusedAssetCountLoaded) loadUnusedAssetCount();
    }, [mainView, unusedAssetCountLoaded, loadUnusedAssetCount]);

    return count;
};

export default useAssetCount;
