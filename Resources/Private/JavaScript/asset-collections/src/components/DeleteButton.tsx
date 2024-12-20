import React, { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi, useNotify } from '@media-ui/core';
import { useConfigQuery } from '@media-ui/core/src/hooks';
import { selectedAssetCollectionAndTagState } from '@media-ui/core/src/state';
import { useDeleteTag, useSelectedTag } from '@media-ui/feature-asset-tags';

import useDeleteAssetCollection from '../hooks/useDeleteAssetCollection';
import useSelectedAssetCollection from '../hooks/useSelectedAssetCollection';

const DeleteButton: React.FC = () => {
    const { translate } = useIntl();
    const { config } = useConfigQuery();
    const Notify = useNotify();
    const { approvalAttainmentStrategy } = useMediaUi();
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedTag = useSelectedTag();
    const { deleteTag } = useDeleteTag();
    const { deleteAssetCollection } = useDeleteAssetCollection();
    const setSelectedAssetCollectionAndTag = useSetRecoilState(selectedAssetCollectionAndTagState);

    const onClickDelete = useCallback(async () => {
        if (selectedTag) {
            const canDeleteTag = await approvalAttainmentStrategy.obtainApprovalToDeleteTag({
                tag: selectedTag,
            });
            if (!canDeleteTag) return;
            deleteTag(selectedTag.id)
                .then(() => {
                    Notify.ok(translate('action.deleteTag.success', 'The tag has been deleted'));
                    setSelectedAssetCollectionAndTag(({ assetCollectionId }) => ({ tagId: null, assetCollectionId }));
                })
                .catch(({ message }) => {
                    Notify.error(translate('action.deleteTag.error', 'Error while trying to delete the tag'), message);
                });
        } else if (selectedAssetCollection) {
            const canDeleteAssetCollection = await approvalAttainmentStrategy.obtainApprovalToDeleteAssetCollection({
                assetCollection: selectedAssetCollection,
            });
            if (!canDeleteAssetCollection) return;

            deleteAssetCollection(selectedAssetCollection.id)
                .then(() => {
                    Notify.ok(
                        translate('assetCollectionActions.delete.success', 'Asset collection was successfully deleted')
                    );
                    setSelectedAssetCollectionAndTag({ tagId: null, assetCollectionId: null });
                })
                .catch(() => {
                    return;
                });
        }
    }, [
        selectedTag,
        selectedAssetCollection,
        translate,
        deleteTag,
        Notify,
        setSelectedAssetCollectionAndTag,
        approvalAttainmentStrategy,
        deleteAssetCollection,
    ]);

    return (
        <IconButton
            icon="trash-alt"
            size="regular"
            style="transparent"
            hoverStyle="error"
            disabled={
                (!selectedAssetCollection || !config.canManageAssetCollections || !selectedAssetCollection.canDelete) &&
                (!selectedTag || !config.canManageTags)
            }
            title={translate('assetCollectionTree.toolbar.delete', 'Delete')}
            onClick={onClickDelete}
        />
    );
};

export default React.memo(DeleteButton);
