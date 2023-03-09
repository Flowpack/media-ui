import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { Headline, Icon } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { selectedInspectorViewState } from '@media-ui/core/src/state';
import { useSelectedAssetCollection } from '@media-ui/feature-asset-collections';
import { useSelectedTag } from '@media-ui/feature-asset-tags';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    currentSelection: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        overflow: 'hidden',
    },
    headline: {
        userSelect: 'none',
        flex: '1 1 100%',
        fontWeight: 'bold',
        lineHeight: theme.spacing.goldenUnit,
    },
    label: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        '& svg': {
            marginRight: theme.spacing.half,
        },
    },
}));

const CurrentSelection = () => {
    const classes = useStyles();
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedTag = useSelectedTag();
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);
    const { translate } = useIntl();

    const selection = useMemo(() => {
        let icon = 'question';
        let label = null;

        if (selectedInspectorView === 'assetCollection') {
            icon = 'folder';
            label = selectedAssetCollection?.title;
        } else if (selectedInspectorView === 'tag') {
            icon = 'tag';
            label = selectedTag?.label;
        }

        return { icon, label };
    }, [selectedTag, selectedAssetCollection, selectedInspectorView]);

    if (!selection.label || selectedInspectorView === 'asset') return null;

    return (
        <div className={classes.currentSelection}>
            <Headline type="h2" className={classes.headline}>
                {selectedInspectorView === 'assetCollection'
                    ? translate('currentSelection.assetCollection.headline', 'Selected collection')
                    : translate('currentSelection.tag.headline', 'Selected tag')}
            </Headline>
            <div className={classes.label} title={selection.label}>
                <Icon icon={selection.icon} />
                {selection.label}
            </div>
        </div>
    );
};

export default React.memo(CurrentSelection);
