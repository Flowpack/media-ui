import { useRecoilValue } from 'recoil';
import { useQuery } from '@apollo/client';

import { Tag } from '../interfaces';
import { selectedTagIdState } from '../state';
import { TAG } from '../queries';

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
