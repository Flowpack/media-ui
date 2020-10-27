import * as React from 'react';
import { useCallback, useMemo } from 'react';

import { Headline, MultiSelectBox } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useNotify } from '../../../core';
import { useSelectedAsset, useSetAssetTags, useTagsQuery } from '../../../hooks';
import { Asset } from '../../../interfaces';
import { IconLabel } from '../../Presentation';

const useStyles = createUseMediaUiStyles({
    tagSelectBox: {},
    tagSelection: {}
});

const tagsMatchAsset = (tags: string[], asset: Asset) => {
    return (
        tags.join(',') ===
        asset.tags
            .map(tag => tag.label)
            .sort()
            .join(',')
    );
};

const TagSelectBox: React.FC = () => {
    const classes = useStyles();
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
                        // setSelectedAssetI(data.setAssetTags);
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
        <div className={classes.tagSelectBox}>
            <Headline type="h2">
                <IconLabel icon="tags" label={translate('inspector.tags', 'Tags')} />
            </Headline>
            <MultiSelectBox
                className={classes.tagSelection}
                disabled={loading || selectedAsset.assetSource.readOnly}
                placeholder={translate('inspector.tags.placeholder', 'Select a tag')}
                values={tags}
                optionValueField="label"
                options={allTags}
                searchOptions={allTags}
                onValuesChange={handleChange}
            />
        </div>
    );
};

export default React.memo(TagSelectBox);
