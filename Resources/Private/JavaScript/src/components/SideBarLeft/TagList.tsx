import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree';
import { useMediaUi, useIntl, createUseMediaUiStyles } from '../../core';
import { useAssetSourceFilter } from '../../hooks';
import { MediaUiTheme } from '../../interfaces';

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

const withDragDropContext = DragDropContext(HTML5Backend);

const TagList = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { assetSources, tags, tagFilter, setTagFilter } = useMediaUi();
    const [assetSourceFilter] = useAssetSourceFilter();

    const selectedAssetSource = assetSources.find(assetSource => assetSource.identifier === assetSourceFilter);

    return (
        <>
            {selectedAssetSource?.supportsTagging && (
                <nav className={classes.container}>
                    <strong>{translate('tagList.header', 'Tags')}</strong>

                    <Tree className={classes.tree}>
                        <Tree.Node>
                            <Tree.Node.Header
                                isActive={!tagFilter}
                                label={translate('tagList.showAll', 'All')}
                                title={translate('tagList.showAll.title', 'Show assets for all tags')}
                                icon="tag"
                                level={1}
                                onClick={() => setTagFilter(null)}
                                hasChildren={true}
                            />
                            {tags &&
                                tags.map(tag => (
                                    <Tree.Node key={tag.label}>
                                        <Tree.Node.Header
                                            isActive={tagFilter?.label == tag.label}
                                            label={tag.label}
                                            title="Tag"
                                            icon="tag"
                                            level={2}
                                            onClick={() => setTagFilter(tag)}
                                            hasChildren={false}
                                        />
                                    </Tree.Node>
                                ))}
                        </Tree.Node>
                    </Tree>
                </nav>
            )}
        </>
    );
};

export default withDragDropContext(TagList);
