import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { selectedAssetSourceState } from '@media-ui/feature-asset-sources';

import { ASSET_COUNT } from '../queries';
import {
    searchTermState,
    selectedAssetCollectionAndTagState,
    selectedAssetTypeState,
    selectedMediaTypeState,
} from '../state';

interface AssetCountQueryResult {
    assetCount: number;
}

interface AssetCountVariables {
    assetCollectionId?: string;
    assetSourceId?: string;
    tagId?: string;
    mediaType?: MediaType | '';
    assetType?: AssetType | '';
    searchTerm?: string;
}

export default function useAssetCountQuery(total = false) {
    const searchTerm = useRecoilValue(searchTermState);
    const { tagId, assetCollectionId } = useRecoilValue(selectedAssetCollectionAndTagState);
    const assetSourceId = useRecoilValue(selectedAssetSourceState);
    const mediaType = useRecoilValue(selectedMediaTypeState);
    const assetType = useRecoilValue(selectedAssetTypeState);
    const { data, loading } = useQuery<AssetCountQueryResult, AssetCountVariables>(ASSET_COUNT, {
        variables: {
            assetCollectionId: total ? undefined : assetCollectionId,
            assetSourceId,
            mediaType,
            assetType,
            tagId: total ? undefined : tagId,
            searchTerm: searchTerm.toString(),
        },
    });
    return { assetCount: data?.assetCount || 0, loading };
}
