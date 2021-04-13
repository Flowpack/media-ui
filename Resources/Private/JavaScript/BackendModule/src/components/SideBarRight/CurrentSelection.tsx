import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useRecoilState } from 'recoil';
import { fromString as getMediaTypeFromString } from 'media-type';

import { Headline, SelectBox } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { useSelectedAsset, useSelectedAssetCollection, useSelectedTag } from '@media-ui/core/src/hooks';
import { selectedInspectorViewState } from '@media-ui/core/src/state';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    currentSelection: {},
    headline: {
        fontWeight: 'bold',
        lineHeight: theme.spacing.goldenUnit,
    },
}));

const CurrentSelection = () => {
    const classes = useStyles();
    const selectedAsset = useSelectedAsset();
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedTag = useSelectedTag();
    const [selectedInspectorView, setSelectedInspectorView] = useRecoilState(selectedInspectorViewState);
    const { translate } = useIntl();

    const assetIcon = useMemo(() => {
        if (selectedAsset?.file.mediaType) {
            const mainMediaType = getMediaTypeFromString(selectedAsset.file.mediaType);
            if (mainMediaType.type === 'audio') return 'file-audio';
            if (mainMediaType.type === 'video') return 'file-video';
            if (mainMediaType.type === 'image') return 'file-image';
        }
        return 'file';
    }, [selectedAsset?.file.mediaType]);

    // Create selection options for parent tag/collection
    const options = [
        selectedAssetCollection && {
            value: 'assetCollection',
            label: selectedAssetCollection.title,
            icon: 'folder',
        },
        selectedTag && {
            value: 'tag',
            label: selectedTag.label,
            icon: 'tag',
        },
        selectedAsset && { value: 'asset', label: selectedAsset.label, icon: assetIcon },
    ].filter(Boolean);
    const selectedOption = options.find((o) => o.value === selectedInspectorView);
    const value = options.find((o) => o.value === selectedInspectorView) ? selectedInspectorView : options[0]?.value;

    // @TODO get rid of this junk code in favour of something like this https://neos-project.slack.com/archives/CUEUD49ED/p1604002816009700
    useEffect(() => {
        if (!selectedOption) {
            const firstValue = options[0]?.value;
            if (firstValue) {
                setSelectedInspectorView(firstValue as 'asset' | 'assetCollection' | 'tag');
            }
        }
    });

    if (!selectedAsset && !selectedAssetCollection) return null;

    return (
        <div className={classes.currentSelection}>
            <Headline type="h2" className={classes.headline}>
                {translate('currentSelection.headline', 'Selected element')}
            </Headline>
            <SelectBox options={options} onValueChange={setSelectedInspectorView} value={value} />
        </div>
    );
};

export default React.memo(CurrentSelection);
