import { useRecoilValue } from 'recoil';
import { useQuery } from '@apollo/client';

import selectedTagIdState from '../state/selectedTagIdState';
import TAG from '../queries/tag';
import { selectedAssetSourceState } from '@media-ui/feature-asset-sources';

interface TagQueryResult {
    tag: Tag;
    assetSourceId: AssetSourceId;
}

const useSelectedTag = (): Tag => {
    const assetSourceId = useRecoilValue(selectedAssetSourceState);
    const selectedTagId = useRecoilValue(selectedTagIdState);

    const { data } = useQuery<TagQueryResult>(TAG, {
        variables: { id: selectedTagId, assetSourceId },
        skip: !selectedTagId,
    });

    return data?.tag || null;
};

export default useSelectedTag;
