import React, { useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';

import { Button, Label, TextInput } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core/src';
import { Dialog } from '@media-ui/core/src/components';

import useCreateAssetCollection from '../hooks/useCreateAssetCollection';
import useSelectedAssetCollection from '../hooks/useSelectedAssetCollection';
import createAssetCollectionDialogVisibleState from '../state/createAssetCollectionDialogVisibleState';

import './CreateAssetCollectionDialog.module.css';

const CreateAssetCollectionDialog = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const [dialogVisible, setDialogVisible] = useRecoilState(createAssetCollectionDialogVisibleState);
    const [title, setTitle] = useState('');
    const { createAssetCollection } = useCreateAssetCollection();
    const selectedAssetCollection = useSelectedAssetCollection();

    const handleChange = useCallback((value: string) => {
        setTitle(value.trim());
    }, []);

    const handleRequestClose = useCallback(() => setDialogVisible(false), [setDialogVisible]);
    const handleCreate = useCallback(() => {
        setDialogVisible(false);
        createAssetCollection(title, selectedAssetCollection?.id)
            .then(() => {
                Notify.ok(translate('assetCollectionActions.create.success', 'Asset collection was created'));
            })
            .catch((error) => {
                Notify.error(
                    translate('assetCollectionActions.create.error', 'Failed to create asset collection'),
                    error.message
                );
            });
    }, [setDialogVisible, createAssetCollection, title, selectedAssetCollection?.id, Notify, translate]);

    return (
        <Dialog
            isOpen={dialogVisible}
            title={translate('createAssetCollectionDialog.title', 'Create Asset Collection in "{location}"', {
                location: selectedAssetCollection?.title || 'Root',
            })}
            onRequestClose={handleRequestClose}
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={handleRequestClose}>
                    {translate('general.cancel', 'Cancel')}
                </Button>,
                <Button key="upload" style="success" hoverStyle="success" disabled={!title} onClick={handleCreate}>
                    {translate('general.create', 'Create')}
                </Button>,
            ]}
        >
            <div className="formBody">
                <Label>{translate('general.title', 'Title')}</Label>
                <TextInput setFocus type="text" onChange={handleChange} onEnterKey={title ? handleCreate : null} />
            </div>
        </Dialog>
    );
};

export default React.memo(CreateAssetCollectionDialog);
