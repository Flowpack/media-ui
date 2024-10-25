import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { TextInput } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core';
import { selectedInspectorViewState } from '@media-ui/core/src/state';
import { useConfigQuery } from '@media-ui/core/src/hooks';
import { useSelectedAssetCollection, useUpdateAssetCollection } from '@media-ui/feature-asset-collections';

import { TagSelectBoxAssetCollection } from '.';
import Actions from './Actions';
import Property from './Property';
import InspectorContainer from './InspectorContainer';
import ParentCollectionSelectBox from './ParentCollectionSelectBox';

// TASK: Move into media module package
const AssetCollectionInspector = () => {
    const { config } = useConfigQuery();
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);
    const Notify = useNotify();
    const { translate } = useIntl();
    const [title, setTitle] = useState<string>('');

    const { updateAssetCollection } = useUpdateAssetCollection();

    const hasUnpublishedChanges = selectedAssetCollection && title !== selectedAssetCollection.title;

    const handleChange = useCallback((value: string) => {
        setTitle(value.trim());
    }, []);

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
                <TextInput
                    type="text"
                    value={title}
                    onChange={handleChange}
                    onEnterKey={handleApply}
                    disabled={!config.canManageAssetCollections}
                />
            </Property>

            {config.canManageAssetCollections && (
                <Actions
                    handleApply={handleApply}
                    handleDiscard={handleDiscard}
                    hasUnpublishedChanges={hasUnpublishedChanges}
                    inputValid={!!title}
                />
            )}

            <TagSelectBoxAssetCollection />
            <ParentCollectionSelectBox />
        </InspectorContainer>
    );
};

export default React.memo(AssetCollectionInspector);
