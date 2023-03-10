import * as React from 'react';
import { useRecoilState } from 'recoil';

import { Button, TextInput, Label } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, useNotify } from '@media-ui/core/src';
import { Dialog } from '@media-ui/core/src/components';
import { useCreateAssetCollection, useSelectedAssetCollection } from '@media-ui/feature-asset-collections';

import { useCallback } from 'react';
import { createAssetCollectionDialogState } from '../../state';

const useStyles = createUseMediaUiStyles(() => ({
    formBody: {
        padding: 16,
    },
}));

const CreateAssetCollectionDialog = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const Notify = useNotify();
    const [dialogState, setDialogState] = useRecoilState(createAssetCollectionDialogState);
    const createPossible = !!(dialogState.title && dialogState.title.trim());
    const { createAssetCollection } = useCreateAssetCollection();
    const selectedAssetCollection = useSelectedAssetCollection();

    const handleRequestClose = useCallback(() => setDialogState({ title: '', visible: false }), [setDialogState]);
    const handleCreate = useCallback(() => {
        setDialogState((state) => ({ ...state, visible: false }));
        createAssetCollection(dialogState.title, selectedAssetCollection.id)
            .then(() => {
                Notify.ok(translate('assetCollectionActions.create.success', 'Asset collection was created'));
            })
            .catch((error) => {
                Notify.error(
                    translate('assetCollectionActions.create.error', 'Failed to create asset collection'),
                    error.message
                );
            });
    }, [setDialogState, createAssetCollection, dialogState.title, selectedAssetCollection.id, Notify, translate]);
    const setTitle = useCallback((title) => setDialogState((state) => ({ ...state, title })), [setDialogState]);

    return (
        <Dialog
            isOpen={dialogState.visible}
            title={translate('createAssetCollectionDialog.title', 'Create Asset Collection in "{location}"', {
                location: selectedAssetCollection?.title || 'Root',
            })}
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
                <Label>{translate('general.title', 'Title')}</Label>
                <TextInput
                    setFocus
                    type="text"
                    value={dialogState.title}
                    onChange={setTitle}
                    onEnterKey={createPossible ? handleCreate : null}
                />
            </div>
        </Dialog>
    );
};

export default React.memo(CreateAssetCollectionDialog);
