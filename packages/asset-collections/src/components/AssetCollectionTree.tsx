import React, { useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Tree, SelectBox } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import dndTypes from '@media-ui/core/src/constants/dndTypes';
import { IconStack } from '@media-ui/core/src/components';
import useAssetCountQuery from '@media-ui/core/src/hooks/useAssetCountQuery';
import { useTagsQuery } from '@media-ui/feature-asset-tags';
import { useSelectedAssetSource } from '@media-ui/feature-asset-sources';

import AssetCollectionTreeNode from './AssetCollectionTreeNode';
import AddAssetCollectionButton from './AddAssetCollectionButton';
import TagTreeNode from './TagTreeNode';
import DeleteButton from './DeleteButton';
import AddTagButton from './AddTagButton';
import FavouriteButton from './FavouriteButton';
import { assetCollectionTreeViewState } from '../state/assetCollectionTreeViewState';
import { assetCollectionFavouritesState } from '../state/assetCollectionFavouritesState';
import useAssetCollectionsQuery from '../hooks/useAssetCollectionsQuery';
import { UNASSIGNED_COLLECTION_ID } from '../hooks/useAssetCollectionQuery';

import classes from './AssetCollectionTree.module.css';
import { useAssetCollectionDnd } from '../provider/AssetCollectionTreeDndProvider';

const DraggedNodeRenderer: React.FC<{
    node: { contextPath: AssetCollectionId };
    nodeDndType: string;
    level: number;
}> = ({ node, level }) => {
    return (
        <AssetCollectionTreeNode assetCollectionId={node.contextPath} level={level} renderChildCollections={false} />
    );
};

const AssetCollectionTree = () => {
    const { translate } = useIntl();
    const { assetCollections } = useAssetCollectionsQuery();
    const selectedAssetSource = useSelectedAssetSource();
    const { tags } = useTagsQuery();
    const { assetCount: totalAssetCount } = useAssetCountQuery(true);
    const [assetCollectionTreeView, setAssetCollectionTreeViewState] = useRecoilState(assetCollectionTreeViewState);
    const favourites = useRecoilValue(assetCollectionFavouritesState);
    const { currentlyDraggedNodes } = useAssetCollectionDnd();

    const assetCollectionsIdWithoutParent = useMemo(() => {
        return assetCollections.filter((assetCollection) => !assetCollection.parent).map(({ id }) => id);
    }, [assetCollections]);

    const favouriteAssetCollections = useMemo(() => {
        const favouriteIds = Object.keys(favourites);
        return assetCollections.filter(({ id }) => favouriteIds.includes(id));
    }, [assetCollections, favourites]);

    const viewOptions = useMemo(
        () => [
            {
                value: 'collections',
                label: translate('assetCollectionList.viewMode.collections', 'Collections'),
                icon: 'folder',
            },
            {
                value: 'favourites',
                label: translate('assetCollectionList.viewMode.favourites', 'Favourites'),
                icon: 'star',
            },
        ],
        [translate]
    );

    if (!selectedAssetSource?.supportsCollections) return null;

    return (
        <nav className={classes.assetCollectionTree}>
            <SelectBox
                className={classes.viewSelection}
                options={viewOptions}
                value={assetCollectionTreeView}
                optionValueField="value"
                onValueChange={setAssetCollectionTreeViewState}
            />

            <div className={classes.toolbar}>
                <AddAssetCollectionButton />
                <AddTagButton />
                <DeleteButton />
                <FavouriteButton />
            </div>

            <Tree className={classes.tree}>
                <Tree.DragLayer
                    nodeDndType={dndTypes.COLLECTION}
                    ChildRenderer={DraggedNodeRenderer}
                    currentlyDraggedNodes={currentlyDraggedNodes.map((contextPath) => ({ contextPath }))}
                />
                {assetCollectionTreeView === 'favourites' ? (
                    favouriteAssetCollections.map((assetCollection) => (
                        <AssetCollectionTreeNode
                            key={assetCollection.id}
                            assetCollectionId={assetCollection.id}
                            level={1}
                            renderChildCollections={false}
                        />
                    ))
                ) : (
                    <>
                        <AssetCollectionTreeNode
                            label={translate('assetCollectionList.showAll', 'All') + ` (${totalAssetCount})`}
                            title={translate('assetCollectionList.showAll.title', 'Show assets for all collections')}
                            level={1}
                            assetCollectionId={null}
                        >
                            <AssetCollectionTreeNode
                                label={translate('assetCollectionList.unassigned', 'Unassigned')}
                                title={translate(
                                    'assetCollectionList.unassigned.title',
                                    'Show assets which are not assigned to any collection'
                                )}
                                level={2}
                                assetCollectionId={UNASSIGNED_COLLECTION_ID}
                            />
                            <TagTreeNode
                                tagId={'UNTAGGED'}
                                label={translate('assetCollectionList.untagged', 'Untagged')}
                                assetCollectionId={null}
                                level={2}
                                customIconComponent={<IconStack primaryIcon="tag" secondaryIcon="times" />}
                            />
                            {tags?.map((tag) => (
                                <TagTreeNode
                                    key={tag.id}
                                    tagId={tag.id}
                                    label={tag.label}
                                    assetCollectionId={null}
                                    level={2}
                                />
                            ))}
                        </AssetCollectionTreeNode>
                        {assetCollectionsIdWithoutParent.map((assetCollectionId) => (
                            <AssetCollectionTreeNode
                                key={assetCollectionId}
                                assetCollectionId={assetCollectionId}
                                level={1}
                            />
                        ))}
                    </>
                )}
            </Tree>
        </nav>
    );
};

export default React.memo(AssetCollectionTree);
