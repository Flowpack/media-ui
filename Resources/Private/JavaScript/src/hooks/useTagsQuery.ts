import { useQuery } from '@apollo/react-hooks';

import { TAGS } from '../queries';
import { Tag } from '../interfaces';

interface TagsQueryResult {
    tags: Tag[];
}

export default function useAssetTagsQuery() {
    const { data, loading } = useQuery<TagsQueryResult>(TAGS);
    return { tags: data?.tags || [], loading };
}
