import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { Tree, IconButton } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useMediaUi, useIntl, useNotify } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';
import AssetCollectionTreeNode from './AssetCollectionTreeNode';
import TagTreeNode from './TagTreeNode';
import { IconLabel } from '../../Presentation';
import { selectedAssetSourceState } from '../../../state';

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

const AssetCollectionTree = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const Notify = useNotify();
    const {
        assetCollections,
        assetCollectionFilter,
        setAssetCollectionFilter,
        tagFilter,
        setTagFilter,
        tags
    } = useMediaUi();
    const selectedAssetSource = useRecoilValue(selectedAssetSourceState);

    const onClickAdd = () => {
        Notify.info('This feature has not been implemented yet');
    };

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
                            disabled={!assetCollectionFilter && !tagFilter}
                            title={translate('assetCollectionTree.toolbar.create', 'Create new')}
                            onClick={() => onClickAdd()}
                        />
                        <IconButton
                            icon="trash-alt"
                            size="regular"
                            style="transparent"
                            hoverStyle="brand"
                            disabled={!assetCollectionFilter && !tagFilter}
                            title={translate('assetCollectionTree.toolbar.delete', 'Delete')}
                            onClick={() => onClickAdd()}
                        />
                    </div>

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

export default AssetCollectionTree;
