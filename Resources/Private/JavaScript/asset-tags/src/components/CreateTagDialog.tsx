import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { Button, Label, TextInput, Tooltip } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core';
import { useSelectedAssetCollection } from '@media-ui/feature-asset-collections';
import { useCreateTag, useTagsQuery } from '@media-ui/feature-asset-tags';
import { Dialog } from '@media-ui/core/src/components';

import createTagDialogState from '../state/createTagDialogState';

import classes from './CreateTagDialog.module.css';

const CreateTagDialog: React.FC = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const selectedAssetCollection = useSelectedAssetCollection();
    const [dialogState, setDialogState] = useRecoilState(createTagDialogState);
    const { createTag } = useCreateTag();
    const { tags } = useTagsQuery();

    const handleRequestClose = useCallback(
        () =>
            setDialogState({
                visible: false,
                label: '',
                validation: {
                    valid: false,
                    errors: [],
                },
            }),
        [setDialogState]
    );
    const handleCreate = useCallback(() => {
        setDialogState((state) => ({ ...state, visible: false }));
        createTag(dialogState.label, selectedAssetCollection?.id)
            .then(() => {
                Notify.ok(translate('tagActions.create.success', 'Tag was created'));
            })
            .catch(() => {
                return;
            });
    }, [Notify, setDialogState, createTag, dialogState, translate, selectedAssetCollection]);
    const validate = (label) => {
        const validationErrors = [];
        const trimmedLabel = label.trim();
        const tagWithLabelExist = tags?.some((tag) => tag.label === trimmedLabel);

        if (trimmedLabel.length === 0) {
            validationErrors.push(translate('tagActions.validation.emptyTagLabel', 'Please provide a tag label'));
        }

        if (tagWithLabelExist) {
            validationErrors.push(translate('tagActions.validation.tagExists', 'A tag with this label already exists'));
        }

        const validation = {
            errors: validationErrors,
            valid: validationErrors.length === 0,
        };
        setDialogState((state) => ({ ...state, validation }));
    };
    const setLabel = useCallback(
        (label) => {
            validate(label);
            setDialogState((state) => ({ ...state, label }));
        },
        [setDialogState]
    );

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
                    disabled={!dialogState.validation?.valid}
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
                    validationerrors={dialogState.validation?.valid ? null : ['This input is invalid']}
                    required={true}
                    type="text"
                    value={dialogState.label}
                    onChange={setLabel}
                    onEnterKey={dialogState.validation?.valid ? handleCreate : null}
                />
                {dialogState.validation?.errors?.length > 0 && (
                    <Tooltip renderInline asError>
                        <ul>
                            {dialogState.validation.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Tooltip>
                )}
            </div>
        </Dialog>
    );
};

export default React.memo(CreateTagDialog);
