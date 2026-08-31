import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { TextInput, Tooltip } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core';
import { validateLabelOrTitle } from '@media-ui/core/src/helper';
import { selectedInspectorViewState } from '@media-ui/core/src/state';
import { useConfigQuery } from '@media-ui/core/src/hooks';
import { useSelectedAssetCollection, useUpdateAssetCollection } from '@media-ui/feature-asset-collections';
import { selectedAssetSourceIdState } from '@media-ui/feature-asset-sources';

import { TagSelectBoxAssetCollection } from '.';
import Actions from './Actions';
import Property from './Property';
import InspectorContainer from './InspectorContainer';
import ParentCollectionSelectBox from './ParentCollectionSelectBox';

const AssetCollectionInspector = () => {
    const { config } = useConfigQuery();
    const selectedAssetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);
    const Notify = useNotify();
    const { translate } = useIntl();
    const [title, setTitle] = useState<string>('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const { updateAssetCollection } = useUpdateAssetCollection();

    const hasUnpublishedChanges = selectedAssetCollection && title !== selectedAssetCollection.title;

    const validateTitle = useCallback(
        (value: string) => {
            const errors: string[] = [];
            if (value.trim().length === 0) {
                errors.push(translate('assetCollectionActions.validation.emptyTitle', 'Please provide a title'));
            } else if (!validateLabelOrTitle(value)) {
                errors.push(
                    translate(
                        'assetCollectionActions.validation.invalidTitle',
                        'The title must be 1-255 characters and must not have leading or trailing whitespace'
                    )
                );
            }
            setValidationErrors(errors);
        },
        [translate]
    );

    const handleChange = useCallback(
        (value: string) => {
            setTitle(value);
            validateTitle(value);
        },
        [setTitle, validateTitle]
    );

    const handleDiscard = useCallback(() => {
        if (selectedAssetCollection) {
            setTitle(selectedAssetCollection.title);
            setValidationErrors([]);
        }
    }, [selectedAssetCollection, setTitle]);

    const handleApply = useCallback(() => {
        if (!validateLabelOrTitle(title)) return;

        if (title !== selectedAssetCollection.title) {
            updateAssetCollection({
                assetCollection: selectedAssetCollection,
                assetSourceId: selectedAssetSourceId,
                title,
            })
                .then(() => {
                    Notify.ok(
                        translate('actions.updateAssetCollection.success', 'The asset collection has been updated')
                    );
                })
                .catch(({ message }) => {
                    Notify.error(
                        translate('actions.deleteAssetCollection.error', 'Error while updating the asset collection'),
                        message
                    );
                });
        }
    }, [title, selectedAssetCollection, updateAssetCollection, selectedAssetSourceId, Notify, translate]);

    useEffect(() => {
        handleDiscard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAssetCollection?.id]);

    if (!selectedAssetCollection || selectedInspectorView !== 'assetCollection') return null;

    return (
        <InspectorContainer>
            <Property label={translate('inspector.title', 'Title')}>
                <TextInput
                    type="text"
                    value={title}
                    onChange={handleChange}
                    onEnterKey={handleApply}
                    validationerrors={validationErrors.length === 0 ? null : ['This input is invalid']}
                    required={true}
                    disabled={!config.canManageAssetCollections}
                />
                {validationErrors.length > 0 && (
                    <Tooltip renderInline asError>
                        <ul>
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Tooltip>
                )}
            </Property>

            {config.canManageAssetCollections && (
                <Actions
                    handleApply={handleApply}
                    handleDiscard={handleDiscard}
                    hasUnpublishedChanges={hasUnpublishedChanges}
                    inputValid={validationErrors.length === 0}
                />
            )}

            <TagSelectBoxAssetCollection />
            <ParentCollectionSelectBox />
        </InspectorContainer>
    );
};

export default React.memo(AssetCollectionInspector);
