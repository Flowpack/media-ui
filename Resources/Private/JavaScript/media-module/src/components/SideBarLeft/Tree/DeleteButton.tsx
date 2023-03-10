import React, { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useDeleteTag, useSelectedTag } from '@media-ui/feature-asset-tags';
import { useDeleteAssetCollection, useSelectedAssetCollection } from '@media-ui/feature-asset-collections';
import { useIntl, useNotify } from '@media-ui/core';
import { selectedAssetCollectionAndTagState } from '@media-ui/core/src/state';

const DeleteButton: React.FC = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedTag = useSelectedTag();
    const { deleteTag } = useDeleteTag();
    const { deleteAssetCollection } = useDeleteAssetCollection();
    const setSelectedAssetCollectionAndTag = useSetRecoilState(selectedAssetCollectionAndTagState);

    const onClickDelete = useCallback(() => {
        if (selectedTag) {
            // TODO: Use custom modal
            const confirm = window.confirm(
                translate('action.deleteTag.confirm', 'Do you really want to delete the tag ' + selectedTag.label, [
                    selectedTag.label,
                ])
            );
            if (!confirm) return;
            deleteTag(selectedTag.id)
                .then(() => {
                    Notify.ok(translate('action.deleteTag.success', 'The tag has been deleted'));
                    setSelectedAssetCollectionAndTag(({ assetCollectionId }) => ({ tagId: null, assetCollectionId }));
                })
                .catch(({ message }) => {
                    Notify.error(translate('action.deleteTag.error', 'Error while trying to delete the tag'), message);
                });
        } else if (selectedAssetCollection) {
            // TODO: Use custom modal
            const confirm = window.confirm(
                translate(
                    'action.deleteAssetCollection.confirm',
                    'Do you really want to delete the asset collection ' + selectedAssetCollection.title,
                    [selectedAssetCollection.title]
                )
            );
            if (!confirm) return;
            deleteAssetCollection(selectedAssetCollection.id)
                .then(() => {
                    Notify.ok(
                        translate('assetCollectionActions.delete.success', 'Asset collection was successfully deleted')
                    );
                    setSelectedAssetCollectionAndTag({ tagId: null, assetCollectionId: null });
                })
                .catch((error) => {
                    Notify.error(
                        translate('assetCollectionActions.delete.error', 'Failed to delete asset collection'),
                        error.message
                    );
                });
        }
    }, [
        selectedTag,
        selectedAssetCollection,
        translate,
        deleteTag,
        setSelectedAssetCollectionAndTag,
        Notify,
        deleteAssetCollection,
    ]);

    return (
        <IconButton
            icon="trash-alt"
            size="regular"
            style="transparent"
            hoverStyle="brand"
            disabled={!selectedAssetCollection && !selectedTag}
            title={translate('assetCollectionTree.toolbar.delete', 'Delete')}
            onClick={onClickDelete}
        />
    );
};

export default React.memo(DeleteButton);
