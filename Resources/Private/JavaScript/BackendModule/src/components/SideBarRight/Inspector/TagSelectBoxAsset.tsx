import * as React from 'react';
import { useCallback, useMemo } from 'react';

import { useIntl, useNotify } from '../../../core';
import { useSelectedAsset, useSetAssetTags, useTagsQuery } from '../../../hooks';
import { Asset, Tag } from '../../../interfaces';
import { TagSelectBox } from '.';

const tagsMatchAsset = (tags: Tag[], asset: Asset) => {
    return (
        tags
            .map(tag => tag.id)
            .sort()
            .join(',') ===
        asset.tags
            .map(tag => tag.id)
            .sort()
            .join(',')
    );
};

const TagSelectBoxAsset = () => {
    const Notify = useNotify();
    const { translate } = useIntl();
    const { tags: allTags } = useTagsQuery();
    const { setAssetTags, loading } = useSetAssetTags();
    const selectedAsset = useSelectedAsset();

    const selectedTagIds = useMemo(() => selectedAsset?.tags.map(({ id }) => id).sort(), [selectedAsset?.tags]);

    const handleChange = useCallback(
        newTags => {
            if (!tagsMatchAsset(newTags, selectedAsset)) {
                setAssetTags({
                    asset: selectedAsset,
                    tags: newTags
                })
                    .then(() => {
                        Notify.ok(translate('actions.setAssetTags.success', 'The asset has been tagged'));
                    })
                    .catch(({ message }) => {
                        Notify.error(translate('actions.setAssetTags.error', 'Error while tagging the asset'), message);
                    });
            }
        },
        [Notify, selectedAsset, setAssetTags, translate]
    );

    if (!selectedAsset) return null;

    return (
        <TagSelectBox
            values={selectedTagIds}
            options={allTags}
            onChange={handleChange}
            disabled={loading || selectedAsset.assetSource.readOnly}
        />
    );
};

export default React.memo(TagSelectBoxAsset);
