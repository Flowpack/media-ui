import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { Headline, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';
import { selectedInspectorViewState } from '@media-ui/core/src/state';
import { useAssetCollectionsQuery, useSelectedAssetCollection } from '@media-ui/feature-asset-collections';
import { useSelectedTag } from '@media-ui/feature-asset-tags';

import classes from './CurrentSelection.module.css';

const CurrentSelection = () => {
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedTag = useSelectedTag();
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);
    const { translate } = useIntl();
    const { assetCollections } = useAssetCollectionsQuery();

    const selection = useMemo(() => {
        let icon = 'question';
        let label: string = null;
        const path: string[] = [];

        if (selectedInspectorView !== 'asset') {
            if (selectedAssetCollection) {
                // Build the absolute path from the selected collection to its root
                let parentCollection = selectedAssetCollection;
                while (parentCollection) {
                    parentCollection = parentCollection.parent
                        ? assetCollections.find(({ id }) => id === parentCollection.parent.id)
                        : null;
                    if (parentCollection) path.push(parentCollection.title);
                }
            }

            if (selectedInspectorView === 'assetCollection') {
                icon = 'folder';
                label = selectedAssetCollection?.title;
            } else if (selectedInspectorView === 'tag') {
                icon = 'tag';
                label = selectedTag?.label;
            }
        }

        return { icon, label, path: path.reverse() };
    }, [selectedTag, selectedAssetCollection, selectedInspectorView]);

    if (!selection.label || selectedInspectorView === 'asset') return null;

    return (
        <div className={classes.currentSelection}>
            <Headline type="h2" className={classes.headline}>
                {selectedInspectorView === 'assetCollection'
                    ? translate('currentSelection.assetCollection.headline', 'Selected collection')
                    : translate('currentSelection.tag.headline', 'Selected tag')}
            </Headline>
            <span className={classes.label} title={selection.label}>
                <Icon icon={selection.icon} />
                {selection.label}
                <br />
            </span>

            <Headline type="h3" className={classes.headline}>
                {translate('currentSelection.path.headline', 'Path')}
            </Headline>
            <div className={classes.breadcrumb}>
                {selection.path.map((piece) => (
                    <span key={piece}>{piece}</span>
                ))}
            </div>
        </div>
    );
};

export default React.memo(CurrentSelection);
