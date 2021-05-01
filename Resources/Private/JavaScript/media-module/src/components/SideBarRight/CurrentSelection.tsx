import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { fromString as getMediaTypeFromString } from 'media-type';

import { Headline, Icon } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { useSelectedAsset, useSelectedAssetCollection, useSelectedTag } from '@media-ui/core/src/hooks';
import { selectedInspectorViewState } from '@media-ui/core/src/state';

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
    const selectedAsset = useSelectedAsset();
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedTag = useSelectedTag();
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);
    const { translate } = useIntl();

    const selection = useMemo(() => {
        let icon = 'question';
        let label = null;

        if (selectedInspectorView === 'asset') {
            if (selectedAsset?.file.mediaType) {
                const mainMediaType = getMediaTypeFromString(selectedAsset.file.mediaType);
                if (mainMediaType.type === 'audio') icon = 'file-audio';
                if (mainMediaType.type === 'video') icon = 'file-video';
                if (mainMediaType.type === 'image') icon = 'file-image';
            } else {
                icon = 'file';
            }
            label = selectedAsset?.label;
        } else if (selectedInspectorView === 'assetCollection') {
            icon = 'folder';
            label = selectedAssetCollection?.title;
        } else if (selectedInspectorView === 'tag') {
            icon = 'tag';
            label = selectedTag?.label;
        }

        return { icon, label };
    }, [selectedAsset, selectedTag, selectedAssetCollection, selectedInspectorView]);

    if (!selection.label) return null;

    return (
        <div className={classes.currentSelection}>
            <Headline type="h2" className={classes.headline}>
                {translate('currentSelection.headline', 'Selected element')}
            </Headline>
            <div className={classes.label} title={selection.label}>
                <Icon icon={selection.icon} />
                {selection.label}
            </div>
        </div>
    );
};

export default React.memo(CurrentSelection);
