import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { ASSET_COUNT } from '../queries';
import useSelectedTag from './useSelectedTag';
import useSelectedAssetCollection from './useSelectedAssetCollection';
import { searchTermState } from '../state';

interface AssetCountQueryResult {
    assetCount: number;
}

interface AssetCountVariables {
    assetCollectionId?: string;
    tagId?: string;
    mediaType?: string;
    searchTerm?: string;
}

export default function useAssetCountQuery() {
    const searchTerm = useRecoilValue(searchTermState);
    const selectedTag = useSelectedTag();
    const selectedAssetCollection = useSelectedAssetCollection();
    const { data, loading } = useQuery<AssetCountQueryResult, AssetCountVariables>(ASSET_COUNT, {
        variables: {
            assetCollectionId: selectedAssetCollection?.id,
            tagId: selectedTag?.id,
            searchTerm: searchTerm,
        },
    });
    return { assetCount: data?.assetCount || 0, loading };
}
