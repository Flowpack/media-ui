import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { TextInput } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core/src';
import { selectedInspectorViewState } from '@media-ui/core/src/state';
import { useSelectedTag, useUpdateTag } from '@media-ui/core/src/hooks';

import Actions from './Actions';
import Property from './Property';
import InspectorContainer from './InspectorContainer';

const TagInspector = () => {
    const selectedTag = useSelectedTag();
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);
    const Notify = useNotify();
    const { translate } = useIntl();
    const [label, setLabel] = useState<string>(null);

    const { updateTag } = useUpdateTag();

    const hasUnpublishedChanges = selectedTag && label !== selectedTag.label;

    const handleDiscard = useCallback(() => {
        if (selectedTag) {
            setLabel(selectedTag.label);
        }
    }, [selectedTag, setLabel]);

    const handleApply = useCallback(() => {
        if (label !== selectedTag.label) {
            updateTag({
                tag: selectedTag,
                label,
            })
                .then(() => {
                    Notify.ok(translate('actions.updateTag.success', 'The tag has been updated'));
                })
                .catch(({ message }) => {
                    Notify.error(translate('actions.updateTag.error', 'Error while updating the tag'), message);
                });
        }
    }, [Notify, translate, selectedTag, updateTag, label]);

    useEffect(() => {
        handleDiscard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTag?.id]);

    if (!selectedTag || selectedInspectorView !== 'tag') return null;

    return (
        <InspectorContainer>
            <Property label={translate('inspector.label', 'Label')}>
                <TextInput type="text" value={label || ''} onChange={setLabel} onEnterKey={handleApply} />
            </Property>

            <Actions
                handleApply={handleApply}
                handleDiscard={handleDiscard}
                hasUnpublishedChanges={hasUnpublishedChanges}
            />
        </InspectorContainer>
    );
};

export default React.memo(TagInspector);
