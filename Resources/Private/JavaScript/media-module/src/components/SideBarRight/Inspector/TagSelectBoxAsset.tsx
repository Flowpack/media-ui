import React, { useCallback, useState, useEffect } from 'react';

import { useIntl, useMediaUi, useNotify } from '@media-ui/core';
import { Asset } from '@media-ui/core/src/interfaces';
import { useSelectedAsset, useSetAssetTags } from '@media-ui/core/src/hooks';
import { Tag, useTagsQuery } from '@media-ui/feature-asset-tags';

import { TagSelectBox } from '.';

const tagsMatchAsset = (tags: Tag[], asset: Asset) => {
    return (
        tags
            .map((tag) => tag.id)
            .sort()
            .join(',') ===
        asset.tags
            .map((tag) => tag.id)
            .sort()
            .join(',')
    );
};

const TagSelectBoxAsset = () => {
    const Notify = useNotify();
    const { translate } = useIntl();
    const {
        approvalAttainmentStrategy: { obtainApprovalToSetAssetTags },
    } = useMediaUi();
    const { tags: allTags } = useTagsQuery();
    const { setAssetTags, loading } = useSetAssetTags();
    const selectedAsset = useSelectedAsset();

    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const syncSelectedTagIds = useCallback(
        () => setSelectedTagIds(selectedAsset?.tags.map(({ id }) => id).sort()),
        [selectedAsset?.tags]
    );

    const handleChange = useCallback(
        async (newTags) => {
            if (!tagsMatchAsset(newTags, selectedAsset)) {
                const hasApprovalToSetAssetTags = await obtainApprovalToSetAssetTags({
                    asset: selectedAsset,
                    newTags,
                });

                if (hasApprovalToSetAssetTags) {
                    try {
                        await setAssetTags({
                            asset: selectedAsset,
                            tags: newTags,
                        });

                        Notify.ok(translate('actions.setAssetTags.success', 'The asset has been tagged'));
                    } catch ({ message }) {
                        Notify.error(translate('actions.setAssetTags.error', 'Error while tagging the asset'), message);
                    }
                } else {
                    syncSelectedTagIds();
                }
            }
        },
        [Notify, selectedAsset, setAssetTags, translate, syncSelectedTagIds, obtainApprovalToSetAssetTags]
    );

    useEffect(() => syncSelectedTagIds(), [syncSelectedTagIds]);

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
