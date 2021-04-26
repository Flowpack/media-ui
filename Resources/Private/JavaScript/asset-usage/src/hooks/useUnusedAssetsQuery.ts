import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useLazyQuery } from '@apollo/client';

import { currentPageState, loadingState } from '@media-ui/core/src/state';
import { Asset } from '@media-ui/core/src/interfaces';
import { ASSETS_PER_PAGE } from '@media-ui/core/src/constants/pagination';

import UNUSED_ASSETS from '../queries/unusedAssets';
import showUnusedAssetsState from '../state/showUnusedAssetsState';

interface UnusedAssetsQueryResult {
    unusedAssets: Asset[];
}

interface UnusedAssetsQueryVariables {
    limit: number;
    offset: number;
}

const useUnusedAssetsQuery = () => {
    const currentPage = useRecoilValue(currentPageState);
    const [isLoading, setIsLoading] = useRecoilState(loadingState);
    const showUnusedAssets = useRecoilValue(showUnusedAssetsState);
    const [assets, setAssets] = useState<Asset[]>([]);

    const limit = ASSETS_PER_PAGE;
    const offset = (currentPage - 1) * ASSETS_PER_PAGE;

    const [query, { loading, error, data, refetch }] = useLazyQuery<
        UnusedAssetsQueryResult,
        UnusedAssetsQueryVariables
    >(UNUSED_ASSETS, {
        notifyOnNetworkStatusChange: false,
        variables: {
            limit,
            offset,
        },
    });

    useEffect(() => {
        if (showUnusedAssets && !loading && !isLoading) {
            query({
                variables: {
                    limit,
                    offset,
                },
            });
            setIsLoading(true);
        } else if (data && !loading && isLoading) {
            setIsLoading(false);
            setAssets(data.unusedAssets);

            // TODO: Update currentPage if asset count changes and current page exceeds limit
        }
        // Don't include `isLoading` to prevent constant reloads
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, data, loading, offset, limit, showUnusedAssets]);

    return { error, assets, refetch };
};

export default useUnusedAssetsQuery;
