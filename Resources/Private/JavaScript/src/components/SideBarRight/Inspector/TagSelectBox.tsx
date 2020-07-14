import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { Label, MultiSelectBox } from '@neos-project/react-ui-components';

import { selectedAssetState } from '../../../state';
import { createUseMediaUiStyles, useIntl, useNotify } from '../../../core';
import { useSetAssetTags, useTagsQuery } from '../../../hooks';
import { Asset } from '../../../interfaces';

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
    const [selectedAsset, setSelectedAsset] = useRecoilState(selectedAssetState);

    const tags = useMemo(() => selectedAsset.tags.map(({ label }) => label).sort(), [selectedAsset.tags]);

    const handleChange = useCallback(
        newTags => {
            if (!tagsMatchAsset(newTags, selectedAsset)) {
                setAssetTags({
                    asset: selectedAsset,
                    tagNames: newTags
                })
                    .then(({ data }) => {
                        setSelectedAsset(data.setAssetTags);
                        Notify.ok(translate('actions.setAssetTags.success', 'The asset has been tagged'));
                    })
                    .catch(({ message }) => {
                        Notify.error(translate('actions.setAssetTags.error', 'Error while tagging the asset'), message);
                    });
            }
        },
        [Notify, selectedAsset, setAssetTags, setSelectedAsset, translate]
    );

    return (
        <div className={classes.tagSelectBox}>
            <Label>{translate('inspector.tags', 'Tags')}</Label>
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
