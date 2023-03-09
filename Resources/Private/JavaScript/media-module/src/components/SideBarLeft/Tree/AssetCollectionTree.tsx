import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useSetRecoilState } from 'recoil';

import { Headline, IconButton, Tree } from '@neos-project/react-ui-components';

import { selectedAssetIdState } from '@media-ui/core/src/state';
import { createUseMediaUiStyles, MediaUiTheme, useIntl, useNotify } from '@media-ui/core/src';
import { useSelectAssetSource } from '@media-ui/core/src/hooks';
import { useDeleteTag, useSelectedTag, selectedTagIdState } from '@media-ui/feature-asset-tags';
import {
    useDeleteAssetCollection,
    useAssetCollectionsQuery,
    useSelectedAssetCollection,
    selectedAssetCollectionIdState,
} from '@media-ui/feature-asset-collections';

import AssetCollectionTreeNode from './AssetCollectionTreeNode';
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
    const setSelectedAssetCollectionId = useSetRecoilState(selectedAssetCollectionIdState);
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedTag = useSelectedTag();
    const setSelectedAssetId = useSetRecoilState(selectedAssetIdState);
    const setSelectedTagId = useSetRecoilState(selectedTagIdState);
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

    const assetCollectionsWithoutParent = useMemo(() => {
        return assetCollections.filter((assetCollection) => !assetCollection.parent);
    }, [assetCollections]);

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
                    label={translate('assetCollectionList.showAll', 'All')}
                    title={translate('assetCollectionList.showAll.title', 'Show assets for all collections')}
                    level={1}
                    assetCollectionId={null}
                    collapsedByDefault={false}
                />
                {assetCollectionsWithoutParent.map((assetCollection, index) => (
                    <AssetCollectionTreeNode key={index} assetCollectionId={assetCollection.id} level={1} />
                ))}
            </Tree>
        </nav>
    );
};

export default React.memo(AssetCollectionTree);
