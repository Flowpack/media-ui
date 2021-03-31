import * as React from 'react';
import { useCallback, useMemo } from 'react';

import { useIntl, useNotify } from '../../../core';
import { useTagsQuery, useUpdateAssetCollection } from '../../../hooks';
import { AssetCollection, Tag } from '../../../interfaces';
import { TagSelectBox } from '.';
import useSelectedAssetCollection from '../../../hooks/useSelectedAssetCollection';

const tagsMatchAssetCollection = (tags: Tag[], assetCollection: AssetCollection) => {
    return (
        tags
            .map((tag) => tag.id)
            .sort()
            .join(',') ===
        assetCollection.tags
            .map((tag) => tag.id)
            .sort()
            .join(',')
    );
};

const TagSelectBoxAssetCollection = () => {
    const Notify = useNotify();
    const { translate } = useIntl();
    const { tags: allTags } = useTagsQuery();
    const { updateAssetCollection } = useUpdateAssetCollection();
    const selectedAssetCollection = useSelectedAssetCollection();

    const tagIds = useMemo(() => selectedAssetCollection?.tags.map(({ id }) => id).sort(), [
        selectedAssetCollection?.tags,
    ]);

    const handleChange = useCallback(
        (newTags: Tag[]) => {
            if (!tagsMatchAssetCollection(newTags, selectedAssetCollection)) {
                updateAssetCollection({
                    assetCollection: selectedAssetCollection,
                    tags: newTags,
                })
                    .then(() => {
                        Notify.ok(
                            translate('actions.tagAssetCollection.success', 'The asset collection has been tagged')
                        );
                    })
                    .catch(({ message }) => {
                        Notify.error(
                            translate('actions.tagAssetCollection.error', 'Error while tagging the asset collection'),
                            message
                        );
                    });
            }
        },
        [Notify, selectedAssetCollection, updateAssetCollection, translate]
    );

    if (!selectedAssetCollection) return null;

    return <TagSelectBox values={tagIds} options={allTags} onChange={handleChange} />;
};

export default React.memo(TagSelectBoxAssetCollection);
