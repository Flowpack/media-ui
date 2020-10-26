import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { IconButton, Tree } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useNotify } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';
import AssetCollectionTreeNode from './AssetCollectionTreeNode';
import TagTreeNode from './TagTreeNode';
import { IconLabel } from '../../Presentation';
import { selectedAssetCollectionState, selectedTagState } from '../../../state';
import {
    useAssetCollectionsQuery,
    useCreateAssetCollection,
    useDeleteAssetCollection,
    useSelectAssetSource,
    useTagsQuery
} from '../../../hooks';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    assetCollectionTree: {
        border: `1px solid ${theme.colors.border}`
    },
    iconWrap: {
        width: theme.spacing.goldenUnit,
        display: 'inline-flex',
        justifyContent: 'center'
    },
    headline: {
        fontWeight: 'bold',
        lineHeight: theme.spacing.goldenUnit,
        paddingLeft: theme.spacing.half
    },
    toolbar: {
        borderTop: `1px solid ${theme.colors.border}`
    },
    tree: {
        borderTop: `1px solid ${theme.colors.border}`
    }
}));

const AssetCollectionTree: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const Notify = useNotify();
    const [selectedAssetCollection, setSelectedAssetCollection] = useRecoilState(selectedAssetCollectionState);
    const [selectedTag, setSelectedTag] = useRecoilState(selectedTagState);
    const { tags } = useTagsQuery();
    const { assetCollections } = useAssetCollectionsQuery();
    const [selectedAssetSource] = useSelectAssetSource();

    const { createAssetCollection } = useCreateAssetCollection();
    const { deleteAssetCollection } = useDeleteAssetCollection();

    const onClickAdd = useCallback(() => {
        createAssetCollection('testing...' + Math.random())
            .then(() => {
                Notify.ok(translate('assetCollectionActions.create.success', 'Asset collection was created'));
            })
            .catch(error => {
                Notify.error(
                    translate('assetCollectionActions.create.error', 'Failed to create asset collection'),
                    error.message
                );
            });
    }, [createAssetCollection, Notify, translate]);
    const onClickDelete = useCallback(() => {
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
    }, [createAssetCollection, Notify, translate]);

    const selectTag = useCallback(
        (tag, assetCollection = null) => {
            setSelectedAssetCollection(assetCollection);
            setSelectedTag(tag);
        },
        [setSelectedTag, setSelectedAssetCollection]
    );
    const selectAssetCollection = useCallback(
        assetCollection => {
            setSelectedTag(null);
            setSelectedAssetCollection(assetCollection);
        },
        [setSelectedTag, setSelectedAssetCollection]
    );

    return (
        <>
            {selectedAssetSource?.supportsCollections && (
                <nav className={classes.assetCollectionTree}>
                    <IconLabel icon="folder" label={translate('assetCollectionList.header', 'Collections')} />

                    <div className={classes.toolbar}>
                        <IconButton
                            icon="plus"
                            size="regular"
                            style="transparent"
                            hoverStyle="brand"
                            title={translate('assetCollectionTree.toolbar.create', 'Create new')}
                            onClick={onClickAdd}
                        />
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
                                isActive={assetCollection.id == selectedAssetCollection?.id && !selectedTag}
                            >
                                {assetCollection.tags?.map(tag => (
                                    <TagTreeNode
                                        key={tag.label}
                                        tag={tag}
                                        assetCollection={assetCollection}
                                        isActive={
                                            assetCollection.id == selectedAssetCollection?.id &&
                                            tag.label == selectedTag?.label
                                        }
                                        level={2}
                                        onClick={selectTag}
                                    />
                                ))}
                            </AssetCollectionTreeNode>
                        ))}
                    </Tree>
                </nav>
            )}
        </>
    );
};

export default React.memo(AssetCollectionTree);
