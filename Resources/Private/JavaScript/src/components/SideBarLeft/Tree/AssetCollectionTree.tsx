import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { IconButton, Tree, Headline } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useNotify } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';
import AssetCollectionTreeNode from './AssetCollectionTreeNode';
import TagTreeNode from './TagTreeNode';
import { IconLabel } from '../../Presentation';
import { selectedAssetCollectionIdState, selectedTagState } from '../../../state';
import {
    useAssetCollectionsQuery,
    useDeleteAssetCollection,
    useSelectAssetSource,
    useTagsQuery,
    useDeleteTag
} from '../../../hooks';
import AddAssetCollectionButton from './AddAssetCollectionButton';
import AddTagButton from './AddTagButton';
import useSelectedAssetCollection from '../../../hooks/useSelectedAssetCollection';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    assetCollectionTree: {
        border: `1px solid ${theme.colors.border}`
    },
    headline: {
        padding: `0 ${theme.spacing.full}`
    },
    iconWrap: {
        width: theme.spacing.goldenUnit,
        display: 'inline-flex',
        justifyContent: 'center'
    },
    toolbar: {
        borderTop: `1px solid ${theme.colors.border}`
    },
    tree: {
        borderTop: `1px solid ${theme.colors.border}`
    }
}));

const AssetCollectionTree = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const Notify = useNotify();
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const selectedAssetCollection = useSelectedAssetCollection();
    const [selectedTag, setSelectedTag] = useRecoilState(selectedTagState);
    const { tags } = useTagsQuery();
    const { assetCollections } = useAssetCollectionsQuery();
    const [selectedAssetSource] = useSelectAssetSource();
    const { deleteTag } = useDeleteTag();

    const { deleteAssetCollection } = useDeleteAssetCollection();

    const selectAssetCollection = useCallback(
        assetCollection => {
            setSelectedTag(null);
            setSelectedAssetCollectionId(assetCollection.id);
        },
        [setSelectedTag, setSelectedAssetCollectionId]
    );
    const onClickDelete = useCallback(() => {
        if (selectedTag) {
            const confirm = window.confirm(
                translate('action.deleteTag.confirm', 'Do you really want to delete the tag ' + selectedTag.label, [
                    selectedTag.label
                ])
            );
            if (!confirm) return;
            deleteTag(selectedTag)
                .then(() => {
                    Notify.ok(translate('action.deleteTag.success', 'The tag has been deleted'));
                })
                .catch(({ message }) => {
                    Notify.error(translate('action.deleteTag.error', 'Error while trying to delete the tag'), message);
                });
            setSelectedTag(null);
            setSelectedAssetCollectionId(null);
        } else if (selectAssetCollection) {
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
                .catch(error => {
                    Notify.error(
                        translate('assetCollectionActions.delete.error', 'Failed to delete asset collection'),
                        error.message
                    );
                });
            setSelectedTag(null);
            setSelectedAssetCollectionId(null);
        }
    }, [
        deleteTag,
        selectAssetCollection,
        selectedTag,
        selectedAssetCollection,
        deleteAssetCollection,
        setSelectedTag,
        setSelectedAssetCollectionId,
        Notify,
        translate
    ]);

    const selectTag = useCallback(
        (tag, assetCollection = null) => {
            setSelectedAssetCollectionId(assetCollection?.id);
            setSelectedTag(tag);
        },
        [setSelectedTag, setSelectedAssetCollectionId]
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
                    isActive={!selectedAssetCollection && !selectedTag}
                    label={translate('assetCollectionList.showAll', 'All')}
                    title={translate('assetCollectionList.showAll.title', 'Show assets for all collections')}
                    level={1}
                    onClick={selectAssetCollection}
                    assetCollection={null}
                    collapsedByDefault={false}
                >
                    {tags?.map(tag => (
                        <TagTreeNode
                            key={tag.label}
                            tag={tag}
                            isActive={!selectedAssetCollection && tag.label == selectedTag?.label}
                            level={2}
                            onClick={selectTag}
                        />
                    ))}
                </AssetCollectionTreeNode>
                {assetCollections.map((assetCollection, index) => (
                    <AssetCollectionTreeNode
                        key={index}
                        assetCollection={assetCollection}
                        onClick={selectAssetCollection}
                        level={1}
                        isActive={assetCollection.title == selectedAssetCollection?.title && !selectedTag}
                    >
                        {assetCollection.tags?.map(tag => (
                            <TagTreeNode
                                key={tag.label}
                                tag={tag}
                                assetCollection={assetCollection}
                                isActive={
                                    assetCollection.id == selectedAssetCollection?.id && tag.label == selectedTag?.label
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
