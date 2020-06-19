import { useLazyQuery } from '@apollo/react-hooks';
import { useEffect, useState } from 'react';

import { ASSETS } from '../queries';
import { Asset, AssetCollection, AssetSource, Tag } from '../interfaces';

interface AssetsQueryResult {
    assets: Asset[];
    assetCollections: AssetCollection[];
    assetSources: AssetSource[];
    assetCount: number;
    tags: Tag[];
}

interface AssetsQueryVariables {
    searchTerm: string;
    assetCollection: string;
    mediaType: string;
    tag: string;
    limit: number;
    offset: number;
}

const useAssetQuery = (variables: AssetsQueryVariables) => {
    const [query, { loading, error, data, refetch }] = useLazyQuery<AssetsQueryResult, AssetsQueryVariables>(ASSETS, {
        notifyOnNetworkStatusChange: false,
        variables
    });

    const [isLoading, setIsLoading] = useState(false);
    const [assetData, setAssetData] = useState<AssetsQueryResult>({
        assets: [],
        assetCollections: [],
        assetSources: [],
        assetCount: 0,
        tags: []
    });

    useEffect(() => {
        if (!loading && !isLoading) {
            query({ variables });
            setIsLoading(true);
        } else if (data && !loading && isLoading) {
            setAssetData(data);
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        query,
        data,
        loading,
        variables.assetCollection,
        variables.limit,
        variables.mediaType,
        variables.offset,
        variables.searchTerm,
        variables.tag
    ]);

    const refetchAssets = () => refetch().then(() => true);

    return { assetData, isLoading, error, refetchAssets };
};

export default useAssetQuery;
