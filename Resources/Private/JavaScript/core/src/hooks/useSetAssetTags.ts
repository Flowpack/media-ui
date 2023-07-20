import { useMutation } from '@apollo/client';

import { SET_ASSET_TAGS } from '../mutations';

interface SetAssetTagsProps {
    asset: Asset;
    tags: Tag[];
}

interface SetAssetTagsVariables {
    id: string;
    assetSourceId: string;
    tagIds: string[];
}

export default function useSetAssetTags() {
    const [action, { error, data, loading }] = useMutation<
        { __typename: string; setAssetTags: Asset },
        SetAssetTagsVariables
    >(SET_ASSET_TAGS);

    const setAssetTags = ({ asset, tags }: SetAssetTagsProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                tagIds: tags.map((tag) => tag.id),
            },
            optimisticResponse: {
                __typename: 'Mutation',
                setAssetTags: {
                    ...asset,
                    tags,
                },
            },
            // The ASSETS query should be triggered to again show the full amount of assets in the current collection
            // FIXME: The TAGS query is triggered to update the asset count in the asset collection list, which could be modified directly in the cache update method below
            refetchQueries: ['ASSETS', 'TAGS'],
        });

    return { setAssetTags, data, error, loading };
}
