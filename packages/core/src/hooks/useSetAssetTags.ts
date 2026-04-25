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
    const [action, { error, data, loading }] = useMutation<{ setAssetTags: MutationResult }, SetAssetTagsVariables>(
        SET_ASSET_TAGS
    );

    const setAssetTags = ({ asset, tags }: SetAssetTagsProps) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                tagIds: tags.map((tag) => tag.id),
            },
            refetchQueries: ['ASSETS', 'TAGS'],
        }).then(({ data: { setAssetTags: result } }) => {
            if (!result.success) {
                throw new Error(result.messages.join(', '));
            }
        });

    return { setAssetTags, data, error, loading };
}
