import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useLazyQuery } from '@apollo/client';

import { currentPageState, loadingState } from '@media-ui/core/src/state';
import { Asset } from '@media-ui/core/src/interfaces';

import UNUSED_ASSETS from '../queries/unusedAssets';
import showUnusedAssetsState from '../state/showUnusedAssetsState';
import { useMediaUi } from '@media-ui/core/src';

interface UnusedAssetsQueryResult {
    unusedAssets: Asset[];
}

interface UnusedAssetsQueryVariables {
    limit: number;
    offset: number;
}

const useUnusedAssetsQuery = () => {
    const {
        featureFlags: {
            pagination: { assetsPerPage },
        },
    } = useMediaUi();
    const currentPage = useRecoilValue(currentPageState);
    const [isLoading, setIsLoading] = useRecoilState(loadingState);
    const showUnusedAssets = useRecoilValue(showUnusedAssetsState);
    const [assets, setAssets] = useState<Asset[]>([]);

    const offset = (currentPage - 1) * assetsPerPage;

    const [query, { loading, error, data, refetch }] = useLazyQuery<
        UnusedAssetsQueryResult,
        UnusedAssetsQueryVariables
    >(UNUSED_ASSETS, {
        notifyOnNetworkStatusChange: false,
        variables: {
            limit: assetsPerPage,
            offset,
        },
    });

    useEffect(() => {
        if (showUnusedAssets && !loading && !isLoading) {
            query({
                variables: {
                    limit: assetsPerPage,
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
    }, [query, data, loading, offset, showUnusedAssets]);

    return { error, assets, refetch };
};

export default useUnusedAssetsQuery;
