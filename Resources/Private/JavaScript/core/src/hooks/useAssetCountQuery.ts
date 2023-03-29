import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { useSelectedTag } from '@media-ui/feature-asset-tags';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';
import { selectedAssetSourceState } from '@media-ui/feature-asset-sources';

import { ASSET_COUNT } from '../queries';
import { searchTermState } from '../state';

interface AssetCountQueryResult {
    assetCount: number;
}

interface AssetCountVariables {
    assetCollectionId?: string;
    assetSourceId?: string;
    tagId?: string;
    mediaType?: string;
    searchTerm?: string;
}

export default function useAssetCountQuery() {
    const searchTerm = useRecoilValue(searchTermState);
    const selectedTag = useSelectedTag();
    const assetCollectionId = useRecoilValue(selectedAssetCollectionIdState);
    const assetSourceId = useRecoilValue(selectedAssetSourceState);
    const { data, loading } = useQuery<AssetCountQueryResult, AssetCountVariables>(ASSET_COUNT, {
        variables: {
            assetCollectionId,
            assetSourceId,
            tagId: selectedTag?.id,
            searchTerm: searchTerm.toString(),
        },
    });
    return { assetCount: data?.assetCount || 0, loading };
}
