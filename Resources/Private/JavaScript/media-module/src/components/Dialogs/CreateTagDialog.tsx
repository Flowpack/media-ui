import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { Button, Label, TextInput } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, useNotify } from '@media-ui/core/src';
import { useCreateTag, useSelectedAssetCollection } from '@media-ui/core/src/hooks';

import { createTagDialogState } from '../../state';

import { Dialog } from './Dialog';

const useStyles = createUseMediaUiStyles(() => ({
    formBody: {
        padding: 16,
    },
}));

const CreateTagDialog: React.FC = () => {
    const classes = useStyles();
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
            <div className={classes.formBody}>
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
