import * as React from 'react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { IconButton, Tree, Headline } from '@neos-project/react-ui-components';

import { selectedAssetCollectionIdState, selectedAssetIdState, selectedTagIdState } from '@media-ui/core/src/state';
import { AssetCollection } from '@media-ui/core/src/interfaces';
import { useIntl, createUseMediaUiStyles, MediaUiTheme, useNotify } from '@media-ui/core/src';
import {
    useAssetCollectionsQuery,
    useDeleteAssetCollection,
    useDeleteTag,
    useSelectAssetCollection,
    useSelectAssetSource,
    useSelectedAssetCollection,
    useSelectedTag,
    useSelectTag,
    useTagsQuery,
} from '@media-ui/core/src/hooks';
import { clipboardVisibleState } from '@media-ui/feature-clipboard/src';

import AssetCollectionTreeNode from './AssetCollectionTreeNode';
import TagTreeNode from './TagTreeNode';
import { IconLabel } from '../../Presentation';
import AddAssetCollectionButton from './AddAssetCollectionButton';
import AddTagButton from './AddTagButton';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    assetCollectionTree: {
        border: `1px solid ${theme.colors.border}`,
    },
    headline: {
        padding: `0 ${theme.spacing.full}`,
    },
    iconWrap: {
        width: theme.spacing.goldenUnit,
        display: 'inline-flex',
        justifyContent: 'center',
    },
    toolbar: {
        borderTop: `1px solid ${theme.colors.border}`,
    },
    tree: {
        borderTop: `1px solid ${theme.colors.border}`,
    },
}));

const AssetCollectionTree = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const Notify = useNotify();
    const selectAssetCollection = useSelectAssetCollection();
    const selectTag = useSelectTag();
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedTag = useSelectedTag();
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedTagId = useSetRecoilState(selectedTagIdState);
    const setClipboardVisibleState = useSetRecoilState(clipboardVisibleState);
    const { tags } = useTagsQuery();
    const { assetCollections } = useAssetCollectionsQuery();
    const [selectedAssetSource] = useSelectAssetSource();
    const { deleteTag } = useDeleteTag();

    const { deleteAssetCollection } = useDeleteAssetCollection();

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
                })
                .catch(({ message }) => {
                    Notify.error(translate('action.deleteTag.error', 'Error while trying to delete the tag'), message);
                });
            setSelectedTagId(null);
            setSelectedAssetCollectionId(null);
            setSelectedAssetId(null);
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
                })
                .catch((error) => {
                    Notify.error(
                        translate('assetCollectionActions.delete.error', 'Failed to delete asset collection'),
                        error.message
                    );
                });
            setSelectedTagId(null);
            setSelectedAssetCollectionId(null);
            setSelectedAssetId(null);
        }
    }, [
        selectedTag,
        selectedAssetCollection,
        translate,
        deleteTag,
        setSelectedTagId,
        setSelectedAssetCollectionId,
        setSelectedAssetId,
        Notify,
        deleteAssetCollection,
    ]);

    const handleSelectAssetCollection = React.useCallback(
        (assetCollection: AssetCollection) => {
            selectAssetCollection(assetCollection);
            setClipboardVisibleState(false);
        },
        [selectAssetCollection, setClipboardVisibleState]
    );

    if (!selectedAssetSource?.supportsCollections) return null;

    return (
        <nav className={classes.assetCollectionTree}>
            <Headline type="h2" className={classes.headline}>
                <IconLabel icon="folder" label={translate('assetCollectionList.header', 'Collections')} />
            </Headline>

            <div className={classes.toolbar}>
                <AddAssetCollectionButton />
                <AddTagButton />
                <IconButton
                    icon="trash-alt"
                    size="regular"
                    style="transparent"
                    hoverStyle="brand"
                    disabled={!selectedAssetCollection && !selectedTag}
                    title={translate('assetCollectionTree.toolbar.delete', 'Delete')}
                    onClick={onClickDelete}
                />
            </div>

            <Tree className={classes.tree}>
                <AssetCollectionTreeNode
                    isActive={!selectedAssetCollection}
                    isFocused={!selectedAssetCollection && !selectedTag}
                    label={translate('assetCollectionList.showAll', 'All')}
                    title={translate('assetCollectionList.showAll.title', 'Show assets for all collections')}
                    level={1}
                    onClick={handleSelectAssetCollection}
                    assetCollection={null}
                    collapsedByDefault={false}
                >
                    {tags?.map((tag) => (
                        <TagTreeNode
                            key={tag.id}
                            tag={tag}
                            isActive={!selectedAssetCollection && tag.id == selectedTag?.id}
                            level={2}
                            onClick={selectTag}
                        />
                    ))}
                </AssetCollectionTreeNode>
                {assetCollections.map((assetCollection, index) => (
                    <AssetCollectionTreeNode
                        key={index}
                        assetCollection={assetCollection}
                        onClick={handleSelectAssetCollection}
                        level={1}
                        isActive={assetCollection.title == selectedAssetCollection?.title}
                        isFocused={assetCollection.title == selectedAssetCollection?.title && !selectedTag}
                    >
                        {assetCollection.tags?.map((tag) => (
                            <TagTreeNode
                                key={tag.id}
                                tag={tag}
                                assetCollection={assetCollection}
                                isActive={
                                    assetCollection.id == selectedAssetCollection?.id && tag.id == selectedTag?.id
                                }
                                level={2}
                                onClick={selectTag}
                            />
                        ))}
                    </AssetCollectionTreeNode>
                ))}
            </Tree>
        </nav>
    );
};

export default React.memo(AssetCollectionTree);
