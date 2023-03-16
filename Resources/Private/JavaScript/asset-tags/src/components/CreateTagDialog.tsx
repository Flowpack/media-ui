import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { Button, Label, TextInput } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core/src';
import { useSelectedAssetCollection } from '@media-ui/feature-asset-collections';
import { useCreateTag } from '@media-ui/feature-asset-tags';
import { Dialog } from '@media-ui/core/src/components';

import createTagDialogState from '../state/createTagDialogState';

import './CreateTagDialog.module.css';

const CreateTagDialog: React.FC = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const selectedAssetCollection = useSelectedAssetCollection();
    const [dialogState, setDialogState] = useRecoilState(createTagDialogState);
    const createPossible = !!(dialogState.label && dialogState.label.trim());
    const { createTag } = useCreateTag();

    const handleRequestClose = useCallback(() => setDialogState({ visible: false, label: '' }), [setDialogState]);
    const handleCreate = useCallback(() => {
        setDialogState((state) => ({ ...state, visible: false }));
        createTag(dialogState.label, selectedAssetCollection?.id)
            .then(() => {
                Notify.ok(translate('assetCollectionActions.create.success', 'Tag was created'));
            })
            .catch((error) => {
                Notify.error(translate('assetCollectionActions.create.error', 'Failed to create tag'), error.message);
            });
    }, [Notify, setDialogState, createTag, dialogState, translate, selectedAssetCollection]);
    const setLabel = useCallback((label) => setDialogState((state) => ({ ...state, label })), [setDialogState]);

    return (
        <Dialog
            isOpen={dialogState.visible}
            title={translate('createTagDialog.title', 'Create tag')}
            onRequestClose={handleRequestClose}
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={handleRequestClose}>
                    {translate('general.cancel', 'Cancel')}
                </Button>,
                <Button
                    key="upload"
                    style="success"
                    hoverStyle="success"
                    disabled={!createPossible}
                    onClick={handleCreate}
                >
                    {translate('general.create', 'Create')}
                </Button>,
            ]}
        >
            <div className="formBody">
                <Label>{translate('general.label', 'Label')}</Label>
                <TextInput
                    setFocus
                    type="text"
                    value={dialogState.label}
                    onChange={setLabel}
                    onEnterKey={createPossible ? handleCreate : null}
                />
            </div>
        </Dialog>
    );
};

export default React.memo(CreateTagDialog);
