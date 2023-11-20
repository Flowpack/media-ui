import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { TextArea, TextInput, ToggablePanel } from '@neos-project/react-ui-components';

import { useIntl, useNotify, useMediaUi } from '@media-ui/core';
import { useSelectedAsset, useUpdateAsset } from '@media-ui/core/src/hooks';
import { IconLabel } from '@media-ui/core/src/components';
import { featureFlagsState } from '@media-ui/core/src/state';

import { CollectionSelectBox, MetadataView, TagSelectBoxAsset } from './index';
import Property from '@media-ui/core/src/components/Property';
import Actions from './Actions';
import InspectorContainer from './InspectorContainer';
import Tasks from './Tasks';

import classes from './PropertyInspector.module.css';
import { useAssetSourcesQuery } from '@media-ui/feature-asset-sources';
import { selectedAssetLabelState, selectedAssetCaptionState, selectedAssetCopyrightNoticeState } from '../../../state';

const PropertyInspector = () => {
    const selectedAsset = useSelectedAsset();
    const { assetSources } = useAssetSourcesQuery();
    const Notify = useNotify();
    const { translate } = useIntl();
    const {
        approvalAttainmentStrategy: { obtainApprovalToUpdateAsset },
    } = useMediaUi();
    const featureFlags = useRecoilValue(featureFlagsState);
    const [label, setLabel] = useRecoilState(selectedAssetLabelState);
    const [caption, setCaption] = useRecoilState(selectedAssetCaptionState);
    const [copyrightNotice, setCopyrightNotice] = useRecoilState(selectedAssetCopyrightNoticeState);
    const [propertyEditorCollapsed, setPropertyEditorCollapsed] = useState<boolean>(
        featureFlags.propertyEditor.collapsed
    );

    const { updateAsset, loading } = useUpdateAsset();

    const isEditable = selectedAsset?.localId && !loading;
    const hasUnpublishedChanges =
        selectedAsset &&
        (label !== selectedAsset.label ||
            caption !== selectedAsset.caption ||
            copyrightNotice !== selectedAsset.copyrightNotice);

    const assetSourceForSelectedAsset = selectedAsset
        ? assetSources.find(({ id }) => id === selectedAsset.assetSource.id)
        : null;

    const handleDiscard = useCallback(() => {
        if (selectedAsset) {
            setLabel(selectedAsset.label);
            setCaption(selectedAsset.caption);
            setCopyrightNotice(selectedAsset.copyrightNotice);
        }
    }, [selectedAsset, setLabel, setCaption, setCopyrightNotice]);

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
                    Notify.error(translate('actions.deleteAsset.error', 'Error while updating the asset'), message);
                }
            }
        }
    }, [Notify, translate, caption, copyrightNotice, label, selectedAsset, updateAsset, obtainApprovalToUpdateAsset]);

    useEffect(() => {
        handleDiscard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAsset?.id]);

    if (!selectedAsset) return null;

    return (
        <InspectorContainer>
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
                            handleApply={handleApply}
                            handleDiscard={handleDiscard}
                            hasUnpublishedChanges={hasUnpublishedChanges}
                            inputValid={!!label}
                        />
                    )}
                </ToggablePanel.Contents>
            </ToggablePanel>

            {assetSourceForSelectedAsset?.supportsCollections && <CollectionSelectBox />}
            {assetSourceForSelectedAsset?.supportsTagging && <TagSelectBoxAsset />}

            <Tasks />
            <MetadataView />
        </InspectorContainer>
    );
};

export default React.memo(PropertyInspector);
