import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { TextInput, Tooltip } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core';
import { validateLabelOrTitle } from '@media-ui/core/src/helper';
import { useConfigQuery } from '@media-ui/core/src/hooks';
import { selectedInspectorViewState } from '@media-ui/core/src/state';
import { useSelectedTag, useUpdateTag } from '@media-ui/feature-asset-tags';
import { selectedAssetSourceIdState } from '@media-ui/feature-asset-sources';

import Actions from './Actions';
import Property from './Property';
import InspectorContainer from './InspectorContainer';

const TagInspector = () => {
    const selectedAssetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const selectedTag = useSelectedTag();
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);
    const Notify = useNotify();
    const { config } = useConfigQuery();
    const { translate } = useIntl();
    const [label, setLabel] = useState<string>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const { updateTag } = useUpdateTag();

    const hasUnpublishedChanges = selectedTag && label !== selectedTag.label;

    const validateLabel = useCallback(
        (value: string) => {
            const errors: string[] = [];
            if (value.trim().length === 0) {
                errors.push(translate('tagActions.validation.emptyTagLabel', 'Please provide a tag label'));
            } else if (!validateLabelOrTitle(value)) {
                errors.push(
                    translate(
                        'tagActions.validation.invalidLabel',
                        'The tag label must be 1-255 characters and must not have leading or trailing whitespace'
                    )
                );
            }
            setValidationErrors(errors);
        },
        [translate]
    );

    const handleLabelChange = useCallback(
        (value: string) => {
            setLabel(value);
            validateLabel(value);
        },
        [setLabel, validateLabel]
    );

    const handleDiscard = useCallback(() => {
        if (selectedTag) {
            setLabel(selectedTag.label);
            setValidationErrors([]);
        }
    }, [selectedTag, setLabel]);

    const handleApply = useCallback(() => {
        if (!validateLabelOrTitle(label)) return;

        if (label !== selectedTag.label) {
            updateTag({
                tag: selectedTag,
                assetSourceId: selectedAssetSourceId,
                label,
            })
                .then(() => {
                    Notify.ok(translate('actions.updateTag.success', 'The tag has been updated'));
                })
                .catch(({ message }) => {
                    Notify.error(translate('actions.updateTag.error', 'Error while updating the tag'), message);
                });
        }
    }, [label, selectedTag, updateTag, selectedAssetSourceId, Notify, translate]);

    useEffect(() => {
        handleDiscard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTag?.id]);

    if (!selectedTag || selectedInspectorView !== 'tag') return null;

    return (
        <InspectorContainer>
            <Property label={translate('inspector.label', 'Label')}>
                <TextInput
                    type="text"
                    value={label || ''}
                    onChange={handleLabelChange}
                    onEnterKey={handleApply}
                    validationerrors={validationErrors.length === 0 ? null : ['This input is invalid']}
                    required={true}
                    disabled={!config.canManageTags}
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

            {config.canManageTags && (
                <Actions
                    handleApply={handleApply}
                    handleDiscard={handleDiscard}
                    hasUnpublishedChanges={hasUnpublishedChanges}
                    inputValid={validationErrors.length === 0}
                />
            )}
        </InspectorContainer>
    );
};

export default React.memo(TagInspector);
