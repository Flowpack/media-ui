import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { TextArea, TextInput, ToggablePanel } from '@neos-project/react-ui-components';

import { AssetUsagesToggleButton } from '@media-ui/feature-asset-usage/src';
import { useIntl, createUseMediaUiStyles, MediaUiTheme, useNotify, useMediaUi } from '@media-ui/core/src';
import { useSelectedAsset, useUpdateAsset } from '@media-ui/core/src/hooks';
import { SimilarAssetsToggleButton } from '@media-ui/feature-similar-assets/src';
import { AssetReplacementButton } from '@media-ui/feature-asset-upload/src/components';

import { CollectionSelectBox, MetadataView, TagSelectBoxAsset } from './index';
import Property from './Property';
import Actions from './Actions';
import InspectorContainer from './InspectorContainer';
import { IconLabel } from '../../Presentation';
import { OpenAssetEditDialogButton } from '@media-ui/feature-asset-editing';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    textArea: {
        // TODO: Remove when overriding rule is removed from Minimal Module Style in Neos
        '.neos textarea&': {
            padding: theme.spacing.half,
        },
    },
    propertyPanel: {},
    propertyPanelHeader: {
        '& h2': {
            padding: 0,
        },
        '& button': {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    },
    propertyPanelContents: {
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        gap: theme.spacing.full,
    },
}));

const PropertyInspector = () => {
    const classes = useStyles();
    const selectedAsset = useSelectedAsset();
    const Notify = useNotify();
    const { translate } = useIntl();
    const {
        featureFlags,
        approvalAttainmentStrategy: { obtainApprovalToUpdateAsset },
        isInMediaDetailsScreen,
    } = useMediaUi();
    const [label, setLabel] = useState<string>(null);
    const [caption, setCaption] = useState<string>(null);
    const [copyrightNotice, setCopyrightNotice] = useState<string>(null);
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
                        />
                    )}
                </ToggablePanel.Contents>
            </ToggablePanel>

            {selectedAsset.assetSource.supportsCollections && <CollectionSelectBox />}
            {selectedAsset.assetSource.supportsTagging && <TagSelectBoxAsset />}
            <AssetUsagesToggleButton />
            {featureFlags.showSimilarAssets && <SimilarAssetsToggleButton />}
            {!selectedAsset.assetSource.readOnly && !isInMediaDetailsScreen && <AssetReplacementButton />}
            {!selectedAsset.assetSource.readOnly && !isInMediaDetailsScreen && <OpenAssetEditDialogButton />}

            <MetadataView />
        </InspectorContainer>
    );
};

export default React.memo(PropertyInspector);
