import { useMutation } from '@apollo/react-hooks';

import { Asset } from '../interfaces';
import { SET_ASSET_TAGS } from '../queries';

interface SetAssetTagsProps {
    asset: Asset;
    tagNames: string[];
}

interface SetAssetTagsVariables {
    id: string;
    assetSourceId: string;
    tags: string[];
}

export default function useSetAssetTags() {
    const [action, { error, data, loading }] = useMutation<
        { __typename: string; setAssetTags: Asset },
        SetAssetTagsVariables
    >(SET_ASSET_TAGS);

    const setAssetTags = ({ asset, tagNames }: SetAssetTagsProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                tags: tagNames
            },
            optimisticResponse: {
                __typename: 'Mutation',
                setAssetTags: {
                    __typename: 'Asset',
                    ...asset,
                    tags: tagNames.map(tagName => ({
                        __typename: 'Tag',
                        label: tagName,
                        children: []
                    }))
                }
            }
        });

    return { setAssetTags: setAssetTags, data, error, loading };
}
