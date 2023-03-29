import React, { useMemo } from 'react';

import { Headline, Tree } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';
import { IconLabel } from '@media-ui/core/src/components';
import { useAssetCollectionsQuery } from '@media-ui/feature-asset-collections';
import { useTagsQuery } from '@media-ui/feature-asset-tags';
import { useSelectedAssetSource } from '@media-ui/feature-asset-sources';

import AssetCollectionTreeNode from './AssetCollectionTreeNode';
import AddAssetCollectionButton from './AddAssetCollectionButton';
import TagTreeNode from './TagTreeNode';
import DeleteButton from './DeleteButton';
import AddTagButton from './AddTagButton';

import classes from './AssetCollectionTree.module.css';

const AssetCollectionTree = () => {
    const { translate } = useIntl();
    const { assetCollections } = useAssetCollectionsQuery();
    const selectedAssetSource = useSelectedAssetSource();
    const { tags } = useTagsQuery();

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
                <DeleteButton />
            </div>

            <Tree className={classes.tree}>
                {/* TODO: Use a custom icon component for the virtual collection that contains all assets and tags to distinguish it from other collections */}
                <AssetCollectionTreeNode
                    label={translate('assetCollectionList.showAll', 'All')}
                    title={translate('assetCollectionList.showAll.title', 'Show assets for all collections')}
                    level={1}
                    assetCollectionId={null}
                >
                    {tags?.map((tag) => (
                        <TagTreeNode key={tag.id} tagId={tag.id} label={tag.label} assetCollectionId={null} level={2} />
                    ))}
                </AssetCollectionTreeNode>
                {assetCollectionsWithoutParent.map((assetCollection, index) => (
                    <AssetCollectionTreeNode key={index} assetCollectionId={assetCollection.id} level={1} />
                ))}
            </Tree>
        </nav>
    );
};

export default React.memo(AssetCollectionTree);
