import React, { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { gql, useApolloClient } from '@apollo/client';

import { Headline, SelectBox } from '@neos-project/react-ui-components';

import { useIntl, useNotify, useMediaUi } from '@media-ui/core';
import { useTagAsset, useUntagAssetById } from '@media-ui/core/src/hooks';
import { IconLabel } from '@media-ui/core/src/components';
import { selectedAssetIdsState } from '@media-ui/core/src/state';
import { useTagsQuery } from '@media-ui/feature-asset-tags';

import * as classes from './TagSelectBox.module.css';

const ASSET_LABEL_FRAGMENT = gql`
    fragment AssetLabel on Asset {
        label
    }
`;

const TagSelectBoxMulti: React.FC = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const client = useApolloClient();
    const {
        approvalAttainmentStrategy: { obtainApprovalToTagAssets, obtainApprovalToUntagAssets },
    } = useMediaUi();
    const selectedAssets = useRecoilValue(selectedAssetIdsState);
    const { tags } = useTagsQuery();
    const { tagAsset } = useTagAsset();
    const { untagAssetById } = useUntagAssetById();
    const [addSearchTerm, setAddSearchTerm] = useState('');
    const [removeSearchTerm, setRemoveSearchTerm] = useState('');

    const getAssetLabel = useCallback(
        (assetId: string): string => {
            const data = client.readFragment({
                fragment: ASSET_LABEL_FRAGMENT,
                id: client.cache.identify({ __typename: 'Asset', id: assetId }),
            });
            return data?.label || assetId;
        },
        [client]
    );

    const getFailedAssetLabels = useCallback(
        (results: PromiseSettledResult<unknown>[]): string[] =>
            results
                .map((result, index) =>
                    result.status === 'rejected' ? getAssetLabel(selectedAssets[index].assetId) : null
                )
                .filter(Boolean),
        [selectedAssets, getAssetLabel]
    );

    const selectBoxOptions = useMemo(() => tags?.map((tag) => ({ label: tag.label, id: tag.id })) ?? [], [tags]);

    const filteredAddOptions = useMemo(
        () => selectBoxOptions.filter(({ label }) => label.toLowerCase().includes(addSearchTerm.toLowerCase())),
        [selectBoxOptions, addSearchTerm]
    );

    const filteredRemoveOptions = useMemo(
        () => selectBoxOptions.filter(({ label }) => label.toLowerCase().includes(removeSearchTerm.toLowerCase())),
        [selectBoxOptions, removeSearchTerm]
    );

    const handleAdd = useCallback(
        async (tagId: string) => {
            if (!tagId || !selectedAssets.length) return;

            const tag = tags?.find((t) => t.id === tagId);
            if (!tag) return;

            const canTag = await obtainApprovalToTagAssets({ assets: selectedAssets, tag });
            if (!canTag) return;

            const mutations = selectedAssets.map((identity) =>
                tagAsset({
                    asset: { id: identity.assetId, assetSource: { id: identity.assetSourceId } },
                    tagId,
                })
            );

            const results = await Promise.allSettled(mutations);
            const failedLabels = getFailedAssetLabels(results);

            await client.reFetchObservableQueries();

            if (failedLabels.length === 0) {
                Notify.ok(translate('actions.bulkTagAssets.success', 'The tag has been added to the selected assets'));
            } else {
                Notify.error(
                    translate('actions.bulkTagAssets.error', 'The following assets could not be tagged:'),
                    failedLabels.join(', ')
                );
            }
        },
        [selectedAssets, tags, tagAsset, client, Notify, translate, obtainApprovalToTagAssets, getFailedAssetLabels]
    );

    const handleRemove = useCallback(
        async (tagId: string) => {
            if (!tagId || !selectedAssets.length) return;

            const tag = tags?.find((t) => t.id === tagId);
            if (!tag) return;

            const canUntag = await obtainApprovalToUntagAssets({ assets: selectedAssets, tag });
            if (!canUntag) return;

            const mutations = selectedAssets.map((identity) =>
                untagAssetById({
                    asset: { id: identity.assetId, assetSource: { id: identity.assetSourceId } },
                    tagId,
                })
            );

            const results = await Promise.allSettled(mutations);
            const failedLabels = getFailedAssetLabels(results);

            await client.reFetchObservableQueries();

            if (failedLabels.length === 0) {
                Notify.ok(
                    translate('actions.bulkUntagAssets.success', 'The tag has been removed from the selected assets')
                );
            } else {
                Notify.error(
                    translate('actions.bulkUntagAssets.error', 'The following assets could not be untagged:'),
                    failedLabels.join(', ')
                );
            }
        },
        [
            selectedAssets,
            tags,
            untagAssetById,
            client,
            Notify,
            translate,
            obtainApprovalToUntagAssets,
            getFailedAssetLabels,
        ]
    );

    return (
        <div>
            <Headline type="h2">
                <IconLabel icon="tags" label={translate('inspector.tags', 'Tags')} />
            </Headline>
            <SelectBox
                className={classes.tagSelectBox}
                placeholder={translate('inspector.tags.addPlaceholder', 'Add tag to selection')}
                value={null}
                optionValueField="id"
                options={filteredAddOptions}
                noMatchesFoundLabel={translate('general.noMatchesFound', 'No matches found')}
                onValueChange={handleAdd}
                onSearchTermChange={setAddSearchTerm}
                displaySearchBox
                allowEmpty={false}
                threshold={0}
            />
            <SelectBox
                className={classes.tagSelectBox}
                placeholder={translate('inspector.tags.removePlaceholder', 'Remove tag from selection')}
                value={null}
                optionValueField="id"
                options={filteredRemoveOptions}
                noMatchesFoundLabel={translate('general.noMatchesFound', 'No matches found')}
                onValueChange={handleRemove}
                onSearchTermChange={setRemoveSearchTerm}
                displaySearchBox
                allowEmpty={false}
                threshold={0}
            />
        </div>
    );
};

export default React.memo(TagSelectBoxMulti);
