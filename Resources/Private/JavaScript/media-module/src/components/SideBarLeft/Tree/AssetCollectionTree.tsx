import * as React from 'react';
import { useMemo } from 'react';

import { Headline, Tree } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';
import { useSelectAssetSource } from '@media-ui/core/src/hooks';
import { useAssetCollectionsQuery } from '@media-ui/feature-asset-collections';

import AssetCollectionTreeNode from './AssetCollectionTreeNode';
import { IconLabel } from '../../Presentation';
import AddAssetCollectionButton from './AddAssetCollectionButton';
import AddTagButton from './AddTagButton';
import DeleteButton from './DeleteButton';

import styles from './AssetCollectionTree.module.css';

const AssetCollectionTree = () => {
    const { translate } = useIntl();
    const { assetCollections } = useAssetCollectionsQuery();
    const [selectedAssetSource] = useSelectAssetSource();

    const assetCollectionsWithoutParent = useMemo(() => {
        return assetCollections.filter((assetCollection) => !assetCollection.parent);
    }, [assetCollections]);

    if (!selectedAssetSource?.supportsCollections) return null;

    return (
        <nav className={styles.assetCollectionTree}>
            <Headline type="h2" className={styles.headline}>
                <IconLabel icon="folder" label={translate('assetCollectionList.header', 'Collections')} />
            </Headline>

            <div className={styles.toolbar}>
                <AddAssetCollectionButton />
                <AddTagButton />
                <DeleteButton />
            </div>

            <Tree className={styles.tree}>
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
