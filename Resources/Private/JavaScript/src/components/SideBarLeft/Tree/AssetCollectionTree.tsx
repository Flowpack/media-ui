import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree';
import { createUseMediaUiStyles, useMediaUi, useIntl } from '../../../core';
import { useAssetSourceFilter } from '../../../hooks';
import { MediaUiTheme } from '../../../interfaces';
import AssetCollectionTreeNode from './AssetCollectionTreeNode';
import TagTreeNode from './TagTreeNode';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    container: {
        '.neos &': {
            padding: '0 1rem 1rem 1rem'
        }
    },
    tree: {
        '.neos &': {
            marginTop: '1rem'
        }
    }
}));

const AssetCollectionTree = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const {
        assetCollections,
        assetCollectionFilter,
        setAssetCollectionFilter,
        assetSources,
        tagFilter,
        setTagFilter,
        tags
    } = useMediaUi();
    const [assetSourceFilter] = useAssetSourceFilter();

    const selectedAssetSource = assetSources.find(assetSource => assetSource.identifier === assetSourceFilter);

    return (
        <>
            {selectedAssetSource?.supportsCollections && (
                <nav className={classes.container}>
                    <strong>{translate('assetCollectionList.header', 'Collections')}</strong>

                    <Tree className={classes.tree}>
                        <AssetCollectionTreeNode
                            isActive={!assetCollectionFilter && !tagFilter}
                            label={translate('assetCollectionList.showAll', 'All')}
                            title={translate('assetCollectionList.showAll.title', 'Show assets for all collections')}
                            level={1}
                            onClick={() => {
                                setAssetCollectionFilter(null);
                                setTagFilter(null);
                            }}
                            assetCollection={null}
                        >
                            {tags?.map(tag => (
                                <TagTreeNode
                                    key={tag.label}
                                    tag={tag}
                                    isActive={!assetCollectionFilter && tag.label == tagFilter?.label}
                                    level={2}
                                    onClick={() => {
                                        setAssetCollectionFilter(null);
                                        setTagFilter(tag);
                                    }}
                                />
                            ))}
                        </AssetCollectionTreeNode>
                        {assetCollections.map((assetCollection, index) => (
                            <AssetCollectionTreeNode
                                key={index}
                                assetCollection={assetCollection}
                                onClick={() => {
                                    setAssetCollectionFilter(assetCollection);
                                    setTagFilter(null);
                                }}
                                level={1}
                                isActive={assetCollection.title == assetCollectionFilter?.title && !tagFilter}
                            >
                                {assetCollection.tags?.map(tag => (
                                    <TagTreeNode
                                        key={tag.label}
                                        tag={tag}
                                        isActive={
                                            assetCollection.title == assetCollectionFilter?.title &&
                                            tag.label == tagFilter?.label
                                        }
                                        level={2}
                                        onClick={() => {
                                            setAssetCollectionFilter(assetCollection);
                                            setTagFilter(tag);
                                        }}
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

const withDragDropContext = DragDropContext(HTML5Backend);
export default withDragDropContext(AssetCollectionTree);
