import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { TextInput } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core/src';
import { useSelectedAssetCollection, useUpdateAssetCollection } from '@media-ui/core/src/hooks';
import { selectedInspectorViewState } from '@media-ui/core/src/state';

import { TagSelectBoxAssetCollection } from '.';
import { useRecoilValue } from 'recoil';
import Actions from './Actions';
import Property from './Property';
import InspectorContainer from './InspectorContainer';

const AssetCollectionInspector = () => {
    const [selectedAssetCollection] = useSelectedAssetCollection();
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);
    const Notify = useNotify();
    const { translate } = useIntl();
    const [title, setTitle] = useState<string>(null);

    const { updateAssetCollection } = useUpdateAssetCollection();

    const hasUnpublishedChanges = selectedAssetCollection && title !== selectedAssetCollection.title;

    const handleDiscard = useCallback(() => {
        if (selectedAssetCollection) {
            setTitle(selectedAssetCollection.title);
        }
    }, [selectedAssetCollection, setTitle]);

    const handleApply = useCallback(() => {
        if (title !== selectedAssetCollection.title) {
            updateAssetCollection({
                assetCollection: selectedAssetCollection,
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
    }, [Notify, translate, selectedAssetCollection, updateAssetCollection, title]);

    useEffect(() => {
        handleDiscard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAssetCollection?.id]);

    if (!selectedAssetCollection || selectedInspectorView !== 'assetCollection') return null;

    return (
        <InspectorContainer>
            <Property label={translate('inspector.title', 'Title')}>
                <TextInput type="text" value={title || ''} onChange={setTitle} onEnterKey={handleApply} />
            </Property>

            <Actions
                handleApply={handleApply}
                handleDiscard={handleDiscard}
                hasUnpublishedChanges={hasUnpublishedChanges}
            />

            <TagSelectBoxAssetCollection />
        </InspectorContainer>
    );
};

export default React.memo(AssetCollectionInspector);
