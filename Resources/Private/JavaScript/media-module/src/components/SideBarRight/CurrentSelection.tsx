import React, { useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Headline } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { selectedAssetCollectionAndTagState, selectedInspectorViewState } from '@media-ui/core/src/state';
import { IconLabel } from '@media-ui/core/src/components';
import {
    collectionPath,
    useAssetCollectionsQuery,
    useSelectedAssetCollection,
} from '@media-ui/feature-asset-collections';
import { useSelectedTag } from '@media-ui/feature-asset-tags';

import classes from './CurrentSelection.module.css';

const CurrentSelection = () => {
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedTag = useSelectedTag();
    const setSelectedAssetCollectionAndTag = useSetRecoilState(selectedAssetCollectionAndTagState);
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);
    const { translate } = useIntl();
    const { assetCollections } = useAssetCollectionsQuery();

    const selection = useMemo(() => {
        let icon = 'question';
        let label: string = null;
        let path: { title: string; id: string }[] = [];

        if (selectedInspectorView !== 'asset') {
            if (selectedAssetCollection) {
                path = collectionPath(selectedAssetCollection, assetCollections);
            }

            if (selectedInspectorView === 'assetCollection') {
                icon = 'folder';
                label = selectedAssetCollection?.title;
            } else if (selectedInspectorView === 'tag') {
                icon = 'tag';
                label = selectedTag?.label;
            }
        }

        return { icon, label, path };
    }, [selectedTag, selectedAssetCollection, selectedInspectorView, assetCollections]);

    if (!selection.label || selectedInspectorView === 'asset') return null;

    return (
        <div className={classes.currentSelection}>
            <Headline type="h2" className={classes.headline}>
                {selectedInspectorView === 'assetCollection'
                    ? translate('currentSelection.assetCollection.headline', 'Selected collection')
                    : translate('currentSelection.tag.headline', 'Selected tag')}
            </Headline>
            <IconLabel icon={selection.icon} className={classes.label} label={selection.label} />

            <Headline type="h3" className={classes.headline}>
                {translate('currentSelection.path.headline', 'Path')}
            </Headline>
            <div className={classes.breadcrumb}>
                <button
                    type="button"
                    onClick={() =>
                        setSelectedAssetCollectionAndTag({
                            assetCollectionId: null,
                            tagId: null,
                        })
                    }
                >
                    /
                </button>
                {selection.path.map(({ id, title }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedAssetCollectionAndTag({ assetCollectionId: id, tagId: null })}
                    >
                        {title}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default React.memo(CurrentSelection);
