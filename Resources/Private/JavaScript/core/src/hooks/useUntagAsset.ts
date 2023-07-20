import { useMutation } from '@apollo/client';

import { UNTAG_ASSET } from '../mutations';

interface UntagAssetProps {
    asset: Asset;
    tagName: string;
}

interface UntagAssetVariables {
    id: string;
    assetSourceId: string;
    tag: string;
}

export default function useUntagAsset() {
    const [action, { error, data, loading }] = useMutation<
        { __typename: string; untagAsset: Asset },
        UntagAssetVariables
    >(UNTAG_ASSET);

    const untagAsset = ({ asset, tagName }: UntagAssetProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                tag: tagName,
            },
            optimisticResponse: {
                __typename: 'Mutation',
                untagAsset: {
                    ...asset,
                    tags: [...asset.tags.filter((tag) => tag.label !== tagName)],
                },
            },
            // The ASSETS query should be triggered to again show the full amount of assets in the current collection
            // FIXME: The TAGS query is triggered to update the asset count in the asset collection list, which could be modified directly in the cache update method below
            refetchQueries: ['ASSETS', 'TAGS'],
        });

    return { untagAsset, data, error, loading };
}
