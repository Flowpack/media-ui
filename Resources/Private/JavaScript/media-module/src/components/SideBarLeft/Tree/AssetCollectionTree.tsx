import * as React from 'react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { IconButton, Tree, Headline } from '@neos-project/react-ui-components';

import { selectedAssetIdState } from '@media-ui/core/src/state';
import { useIntl, createUseMediaUiStyles, MediaUiTheme, useNotify } from '@media-ui/core/src';
import {
    useAssetCollectionsQuery,
    useDeleteAssetCollection,
    useDeleteTag,
    useSelectAssetSource,
    useSelectedAssetCollection,
    useSelectedTag,
    useTagsQuery,
} from '@media-ui/core/src/hooks';

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
    const [selectedTag, setSelectedTag] = useSelectedTag();
    const [selectedAssetCollection, setSelectedAssetCollection] = useSelectedAssetCollection();
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const { tags } = useTagsQuery();
    const { assetCollections } = useAssetCollectionsQuery();
    const [selectedAssetSource] = useSelectAssetSource();
    const { deleteTag } = useDeleteTag();
    const { deleteAssetCollection } = useDeleteAssetCollection();

    console.log(selectedTag, 'selectedTag');
    console.log(selectedAssetCollection, 'selectedAssetCollection');

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
            setSelectedAssetId(null);
            return Promise.all([setSelectedTag(null), setSelectedAssetCollection(null)]);
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
            setSelectedAssetId(null);
            return Promise.all([setSelectedTag(null), setSelectedAssetCollection(null)]);
        }
    }, [
        selectedTag,
        selectedAssetCollection,
        translate,
        deleteTag,
        setSelectedTag,
        setSelectedAssetCollection,
        setSelectedAssetId,
        Notify,
        deleteAssetCollection,
    ]);

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
                    onClick={setSelectedAssetCollection}
                    assetCollection={null}
                    collapsedByDefault={false}
                >
                    {tags?.map((tag) => (
                        <TagTreeNode
                            key={tag.id}
                            tag={tag}
                            isActive={!selectedAssetCollection && tag.id == selectedTag?.id}
                            level={2}
                            onClick={setSelectedTag}
                        />
                    ))}
                </AssetCollectionTreeNode>
                {assetCollections.map((assetCollection, index) => (
                    <AssetCollectionTreeNode
                        key={index}
                        assetCollection={assetCollection}
                        onClick={setSelectedAssetCollection}
                        level={1}
                        isActive={assetCollection.title == selectedAssetCollection?.title && !selectedTag}
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
                                onClick={setSelectedTag}
                            />
                        ))}
                    </AssetCollectionTreeNode>
                ))}
            </Tree>
        </nav>
    );
};

export default React.memo(AssetCollectionTree);
