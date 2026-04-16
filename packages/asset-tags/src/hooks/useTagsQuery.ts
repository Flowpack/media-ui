import { useQuery } from '@apollo/client';

import TAGS from '../queries/tags';

interface TagsQueryResult {
    tags: Tag[];
}

export default function useAssetTagsQuery(assetSourceId: AssetSourceId | null) {
    const { data, loading } = useQuery<TagsQueryResult>(TAGS, {
        variables: {
            assetSourceId,
        },
        skip: !assetSourceId,
    });
    return { tags: data?.tags || [], loading };
}
