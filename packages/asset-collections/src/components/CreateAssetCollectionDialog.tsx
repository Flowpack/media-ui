import React, { useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Button, Label, TextInput, Tooltip } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core';
import { validateLabelOrTitle } from '@media-ui/core/src/helper';
import { Dialog } from '@media-ui/core/src/components';
import { selectedAssetSourceIdState } from '@media-ui/feature-asset-sources';

import useCreateAssetCollection from '../hooks/useCreateAssetCollection';
import useAssetCollectionsQuery from '../hooks/useAssetCollectionsQuery';
import useSelectedAssetCollection from '../hooks/useSelectedAssetCollection';
import { createAssetCollectionDialogVisibleState } from '../state/createAssetCollectionDialogVisibleState';

import classes from './CreateAssetCollectionDialog.module.css';

const CreateAssetCollectionDialog = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const [dialogVisible, setDialogVisible] = useRecoilState(createAssetCollectionDialogVisibleState);
    const [title, setTitle] = useState('');
    const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({
        valid: false,
        errors: [],
    });
    const { createAssetCollection } = useCreateAssetCollection();
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedAssetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const { assetCollections } = useAssetCollectionsQuery(selectedAssetSourceId);

    const handleRequestClose = useCallback(() => {
        setDialogVisible(false);
        setTitle('');
        setValidation({ valid: false, errors: [] });
    }, [setDialogVisible]);

    const validate = useCallback(
        (value: string) => {
            const errors: string[] = [];
            const trimmedTitle = value.trim();

            if (trimmedTitle.length === 0) {
                errors.push(translate('assetCollectionActions.validation.emptyTitle', 'Please provide a title'));
            } else if (!validateLabelOrTitle(value)) {
                errors.push(
                    translate(
                        'assetCollectionActions.validation.invalidTitle',
                        'The title must be 1-255 characters and must not have leading or trailing whitespace'
                    )
                );
            } else if (
                assetCollections.some(
                    (collection) => collection.title === trimmedTitle && collection.id !== selectedAssetCollection?.id
                )
            ) {
                errors.push(
                    translate(
                        'assetCollectionActions.validation.collectionExists',
                        'A collection with this title already exists'
                    )
                );
            }

            setValidation({ valid: errors.length === 0, errors });
        },
        [assetCollections, translate, selectedAssetCollection?.id]
    );

    const handleChange = useCallback(
        (value: string) => {
            validate(value);
            setTitle(value);
        },
        [validate]
    );

    const handleCreate = useCallback(() => {
        if (!validateLabelOrTitle(title)) return;

        const newTitle = title.trim();

        setDialogVisible(false);
        setTitle('');
        setValidation({ valid: false, errors: [] });
        createAssetCollection(newTitle, selectedAssetSourceId, selectedAssetCollection?.id)
            .then(() => {
                Notify.ok(translate('assetCollectionActions.create.success', 'Asset collection was created'));
            })
            .catch(() => {
                return;
            });
    }, [
        setDialogVisible,
        createAssetCollection,
        title,
        selectedAssetSourceId,
        selectedAssetCollection?.id,
        Notify,
        translate,
    ]);

    return (
        <Dialog
            id="CreateAssetCollectionDialog"
            isOpen={dialogVisible}
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
                    disabled={!validation.valid}
                    onClick={handleCreate}
                >
                    {translate('general.create', 'Create')}
                </Button>,
            ]}
        >
            <div className={classes.formBody}>
                <Label htmlFor="asset-collection-title">{translate('general.title', 'Title')}</Label>
                <TextInput
                    id="asset-collection-title"
                    autoFocus
                    validationerrors={validation.valid ? null : ['This input is invalid']}
                    required={true}
                    type="text"
                    value={title}
                    onChange={handleChange}
                    onEnterKey={validation.valid ? handleCreate : null}
                />
                {validation.errors.length > 0 && (
                    <Tooltip renderInline asError>
                        <ul>
                            {validation.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Tooltip>
                )}
            </div>
        </Dialog>
    );
};

export default React.memo(CreateAssetCollectionDialog);
