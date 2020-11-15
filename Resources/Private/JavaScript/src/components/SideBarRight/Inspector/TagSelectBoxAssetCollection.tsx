import * as React from 'react';
import { useCallback, useMemo } from 'react';

import { useIntl, useNotify } from '../../../core';
import { useTagsQuery, useUpdateAssetCollection } from '../../../hooks';
import { AssetCollection } from '../../../interfaces';
import { TagSelectBox } from '.';
import useSelectedAssetCollection from '../../../hooks/useSelectedAssetCollection';

const tagsMatchAssetCollection = (tags: string[], assetCollection: AssetCollection) => {
    return (
        tags.join(',') ===
        assetCollection.tags
            .map(tag => tag.label)
            .sort()
            .join(',')
    );
};

const TagSelectBoxAsset = () => {
    const Notify = useNotify();
    const { translate } = useIntl();
    const { tags: allTags } = useTagsQuery();
    const { updateAssetCollection } = useUpdateAssetCollection();
    const selectedAssetCollection = useSelectedAssetCollection();

    const tags = useMemo(() => selectedAssetCollection?.tags.map(({ label }) => label).sort(), [
        selectedAssetCollection?.tags
    ]);

    const handleChange = useCallback(
        newTags => {
            if (!tagsMatchAssetCollection(newTags, selectedAssetCollection)) {
                updateAssetCollection({
                    assetCollection: selectedAssetCollection,
                    tagNames: newTags
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

    return <TagSelectBox values={tags} options={allTags} onChange={handleChange} />;
};

export default React.memo(TagSelectBoxAsset);
