import { useQuery } from '@apollo/client';

import TAGS from '../queries/tags';

interface TagsQueryResult {
    tags: Tag[];
}

export default function useAssetTagsQuery() {
    const { data, loading } = useQuery<TagsQueryResult>(TAGS);
    return { tags: data?.tags || [], loading };
}
