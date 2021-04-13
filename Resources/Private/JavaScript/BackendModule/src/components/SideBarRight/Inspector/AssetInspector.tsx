import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { TextArea, TextInput } from '@neos-project/react-ui-components';

import { AssetUsageToggleButton } from '@media-ui/feature-asset-usage/src';
import { useIntl, createUseMediaUiStyles, MediaUiTheme, useNotify } from '@media-ui/core/src';
import { useSelectedAsset, useUpdateAsset } from '@media-ui/core/src/hooks';
import { selectedInspectorViewState } from '@media-ui/core/src/state';

import { CollectionSelectBox, MetadataView, TagSelectBoxAsset } from './index';
import { useRecoilValue } from 'recoil';
import Property from './Property';
import Actions from './Actions';
import InspectorContainer from './InspectorContainer';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    textArea: {
        // TODO: Remove when overriding rule is removed from Minimal Module Style in Neos
        '.neos textarea&': {
            padding: theme.spacing.half,
        },
    },
}));

const AssetInspector = () => {
    const classes = useStyles();
    const selectedAsset = useSelectedAsset();
    const Notify = useNotify();
    const { translate } = useIntl();
    const [label, setLabel] = useState<string>(null);
    const [caption, setCaption] = useState<string>(null);
    const [copyrightNotice, setCopyrightNotice] = useState<string>(null);
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);

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

    const handleApply = useCallback(() => {
        if (
            label !== selectedAsset.label ||
            caption !== selectedAsset.caption ||
            copyrightNotice !== selectedAsset.copyrightNotice
        ) {
            updateAsset({
                asset: selectedAsset,
                label,
                caption,
                copyrightNotice,
            })
                .then(() => {
                    Notify.ok(translate('actions.updateAsset.success', 'The asset has been updated'));
                })
                .catch(({ message }) => {
                    Notify.error(translate('actions.deleteAsset.error', 'Error while updating the asset'), message);
                });
        }
    }, [Notify, translate, caption, copyrightNotice, label, selectedAsset, updateAsset]);

    useEffect(() => {
        handleDiscard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAsset?.id]);

    if (!selectedAsset || selectedInspectorView !== 'asset') return null;

    return (
        <InspectorContainer>
            <Property label={translate('inspector.title', 'Title')}>
                <TextInput
                    disabled={!isEditable}
                    type="text"
                    value={label || ''}
                    onChange={setLabel}
                    onEnterKey={handleApply}
                />
            </Property>
            <Property label={translate('inspector.caption', 'Caption')}>
                <TextArea
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

            {selectedAsset.assetSource.supportsCollections && <CollectionSelectBox />}
            {selectedAsset.assetSource.supportsTagging && <TagSelectBoxAsset />}

            <AssetUsageToggleButton />

            <MetadataView />
        </InspectorContainer>
    );
};

export default React.memo(AssetInspector);
