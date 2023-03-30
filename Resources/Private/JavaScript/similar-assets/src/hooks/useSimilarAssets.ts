import { useQuery } from '@apollo/client';

import { Asset } from '@media-ui/core/src/interfaces';

import SIMILAR_ASSETS from '../queries/similarAssets';

interface QueryResult {
    similarAssets: Asset[];
}

export default function useSimilarAssetsQuery(assetIdentity: AssetIdentity) {
    const { data, loading } = useQuery<QueryResult>(SIMILAR_ASSETS, {
        variables: { id: assetIdentity?.assetId, assetSourceId: assetIdentity?.assetSourceId },
        skip: !assetIdentity,
    });
    return { similarAssets: data?.similarAssets || null, loading };
}
