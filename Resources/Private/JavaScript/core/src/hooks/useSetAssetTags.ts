import { useMutation } from '@apollo/client';

import { Tag } from '@media-ui/feature-asset-tags';

import { Asset } from '../interfaces';
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
        });

    return { setAssetTags, data, error, loading };
}
