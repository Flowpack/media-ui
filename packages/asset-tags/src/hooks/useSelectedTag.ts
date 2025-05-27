import { useRecoilValue } from 'recoil';
import { useQuery } from '@apollo/client';

import selectedTagIdState from '../state/selectedTagIdState';
import TAG from '../queries/tag';

interface TagQueryResult {
    tag: Tag;
}

const useSelectedTag = (): Tag => {
    const selectedTagId = useRecoilValue(selectedTagIdState);

    const { data } = useQuery<TagQueryResult>(TAG, {
        variables: { id: selectedTagId },
        skip: !selectedTagId,
    });

    return data?.tag || null;
};

export default useSelectedTag;
