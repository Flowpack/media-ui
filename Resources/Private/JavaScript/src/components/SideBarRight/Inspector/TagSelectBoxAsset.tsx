import * as React from 'react';
import { useCallback, useMemo } from 'react';

import { useIntl, useNotify } from '../../../core';
import { useSelectedAsset, useSetAssetTags, useTagsQuery } from '../../../hooks';
import { Asset } from '../../../interfaces';
import { TagSelectBox } from '.';

const tagsMatchAsset = (tags: string[], asset: Asset) => {
    return (
        tags.join(',') ===
        asset.tags
            .map(tag => tag.label)
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

    const tags = useMemo(() => selectedAsset?.tags.map(({ label }) => label).sort(), [selectedAsset?.tags]);

    const handleChange = useCallback(
        newTags => {
            if (!tagsMatchAsset(newTags, selectedAsset)) {
                setAssetTags({
                    asset: selectedAsset,
                    tagNames: newTags
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
            values={tags}
            options={allTags}
            onChange={handleChange}
            disabled={loading || selectedAsset.assetSource.readOnly}
        />
    );
};

export default React.memo(TagSelectBoxAsset);
