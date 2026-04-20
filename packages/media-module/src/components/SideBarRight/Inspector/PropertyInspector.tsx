import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useApolloClient } from '@apollo/client';

import { TextArea, TextInput, ToggablePanel } from '@neos-project/react-ui-components';

import { useIntl, useNotify, useMediaUi } from '@media-ui/core';
import { useSelectedAsset, useUpdateAsset } from '@media-ui/core/src/hooks';
import { useFailedAssetLabels } from '@media-ui/media-module/src/hooks';
import { IconLabel } from '@media-ui/core/src/components';
import { featureFlagsState, selectedAssetIdsState } from '@media-ui/core/src/state';
import { UPDATE_ASSET } from '@media-ui/core/src/mutations';
import { useInteraction } from '@media-ui/core/src/provider';

import { CollectionSelectBox, MetadataView, TagSelectBoxAsset } from './index';
import TagSelectBoxMulti from './TagSelectBoxMulti';
import Property from './Property';
import Actions from './Actions';
import InspectorContainer from './InspectorContainer';
import Tasks from './Tasks';

import classes from './PropertyInspector.module.css';
import { useAssetSourcesQuery } from '@media-ui/feature-asset-sources';

const PropertyInspector = () => {
    const selectedAssets = useRecoilValue(selectedAssetIdsState);
    const isMultiSelection = selectedAssets.length > 1;
    const selectedAsset = useSelectedAsset();
    const { assetSources } = useAssetSourcesQuery();
    const Notify = useNotify();
    const { translate } = useIntl();
    const {
        approvalAttainmentStrategy: { obtainApprovalToUpdateAsset },
    } = useMediaUi();
    const { confirm } = useInteraction();
    const client = useApolloClient();
    const { getFailedAssetLabels } = useFailedAssetLabels();
    const featureFlags = useRecoilValue(featureFlagsState);
    const [label, setLabel] = useState<string>(null);
    const [caption, setCaption] = useState<string>(null);
    const [copyrightNotice, setCopyrightNotice] = useState<string>(null);
    const [multiLoading, setMultiLoading] = useState<boolean>(false);
    const [propertyEditorCollapsed, setPropertyEditorCollapsed] = useState<boolean>(
        featureFlags.propertyEditor.collapsed
    );

    const { updateAsset, loading } = useUpdateAsset();

    const isEditable = isMultiSelection ? !multiLoading : selectedAsset?.localId && !loading;
    const hasUnpublishedChanges = isMultiSelection
        ? copyrightNotice !== '' && copyrightNotice !== null
        : selectedAsset &&
          (label !== selectedAsset.label ||
              caption !== selectedAsset.caption ||
              copyrightNotice !== selectedAsset.copyrightNotice);

    const assetSourceForSelectedAsset = selectedAsset
        ? assetSources.find(({ id }) => id === selectedAsset.assetSource.id)
        : null;

    const handleDiscard = useCallback(() => {
        if (isMultiSelection) {
            setCopyrightNotice('');
            return;
        }
        if (selectedAsset) {
            setLabel(selectedAsset.label);
            setCaption(selectedAsset.caption);
            setCopyrightNotice(selectedAsset.copyrightNotice);
        }
    }, [isMultiSelection, selectedAsset, setLabel, setCaption, setCopyrightNotice]);

    const handleApply = useCallback(async () => {
        if (
            label !== selectedAsset.label ||
            caption !== selectedAsset.caption ||
            copyrightNotice !== selectedAsset.copyrightNotice
        ) {
            const hasApprovalToUpdateAsset = await obtainApprovalToUpdateAsset({
                asset: selectedAsset,
            });

            if (hasApprovalToUpdateAsset) {
                try {
                    await updateAsset({
                        asset: selectedAsset,
                        label,
                        caption,
                        copyrightNotice,
                    });

                    Notify.ok(translate('actions.updateAsset.success', 'The asset has been updated'));
                } catch ({ message }) {
                    Notify.error(translate('actions.updateAsset.error', 'Error while updating the asset'), message);
                }
            }
        }
    }, [Notify, translate, caption, copyrightNotice, label, selectedAsset, updateAsset, obtainApprovalToUpdateAsset]);

    const handleApplyMulti = useCallback(async () => {
        if (!selectedAssets.length || !copyrightNotice) return;

        const confirmed = await confirm({
            title: translate('actions.bulkUpdateCopyright.confirm.title', 'Update copyright notice'),
            message: translate(
                'actions.bulkUpdateCopyright.confirm.message',
                `Are you sure you want to overwrite the copyright notice of ${selectedAssets.length} assets?`,
                [selectedAssets.length]
            ),
            buttonLabel: translate('actions.bulkUpdateCopyright.confirm.buttonLabel', 'Yes, update copyright notice', [
                selectedAssets.length,
            ]),
        });

        if (!confirmed) return;

        setMultiLoading(true);

        const mutations = selectedAssets.map((identity) =>
            client.mutate({
                mutation: UPDATE_ASSET,
                variables: {
                    id: identity.assetId,
                    assetSourceId: identity.assetSourceId,
                    copyrightNotice,
                },
            })
        );

        const results = await Promise.allSettled(mutations);
        const failedLabels = getFailedAssetLabels(results, selectedAssets);

        await client.reFetchObservableQueries();

        if (failedLabels.length === 0) {
            Notify.ok(
                translate('actions.bulkUpdateCopyright.success', 'Copyright notice updated for all selected assets')
            );
            setCopyrightNotice('');
        } else {
            Notify.error(
                translate('actions.bulkUpdateCopyright.error', 'The following assets could not be updated:'),
                failedLabels.join(', ')
            );
        }

        setMultiLoading(false);
    }, [selectedAssets, copyrightNotice, confirm, translate, client, getFailedAssetLabels, Notify]);

    useEffect(() => {
        handleDiscard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAsset?.id]);

    useEffect(() => {
        if (isMultiSelection) {
            setCopyrightNotice('');
        }
    }, [isMultiSelection]);

    if (!selectedAsset && !isMultiSelection) return null;

    return (
        <InspectorContainer>
            <Tasks />

            <ToggablePanel
                closesToBottom={true}
                className={classes.propertyPanel}
                isOpen={!propertyEditorCollapsed}
                onPanelToggle={() => setPropertyEditorCollapsed((prev) => !prev)}
            >
                <ToggablePanel.Header className={classes.propertyPanelHeader}>
                    <IconLabel icon="pencil" label={translate('propertyPanel.header', 'Properties')} />
                </ToggablePanel.Header>
                <ToggablePanel.Contents className={classes.propertyPanelContents}>
                    {!isMultiSelection && (
                        <>
                            <Property label={translate('inspector.title', 'Title')}>
                                <TextInput
                                    name="label"
                                    disabled={!isEditable}
                                    type="text"
                                    value={label || ''}
                                    onChange={setLabel}
                                    onEnterKey={handleApply}
                                />
                            </Property>
                            <Property label={translate('inspector.caption', 'Caption')}>
                                <TextArea
                                    name="caption"
                                    className={classes.textArea}
                                    disabled={!isEditable}
                                    minRows={3}
                                    expandedRows={6}
                                    value={caption || ''}
                                    onChange={setCaption}
                                />
                            </Property>
                        </>
                    )}
                    <Property label={translate('inspector.copyrightNotice', 'Copyright notice')}>
                        <TextArea
                            name="copyrightNotice"
                            className={classes.textArea}
                            disabled={!isEditable}
                            minRows={2}
                            expandedRows={4}
                            value={copyrightNotice || ''}
                            onChange={setCopyrightNotice}
                        />
                    </Property>

                    {isEditable && (
                        <Actions
                            handleApply={isMultiSelection ? handleApplyMulti : handleApply}
                            handleDiscard={handleDiscard}
                            hasUnpublishedChanges={hasUnpublishedChanges}
                            inputValid={isMultiSelection || !!label}
                        />
                    )}
                </ToggablePanel.Contents>
            </ToggablePanel>

            {(assetSourceForSelectedAsset?.supportsCollections || isMultiSelection) && <CollectionSelectBox />}
            {!isMultiSelection && assetSourceForSelectedAsset?.supportsTagging && <TagSelectBoxAsset />}
            {isMultiSelection && <TagSelectBoxMulti />}

            {!isMultiSelection && <MetadataView />}
        </InspectorContainer>
    );
};

export default React.memo(PropertyInspector);
