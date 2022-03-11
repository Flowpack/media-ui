import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { SelectBox } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useMediaUi } from '@media-ui/core/src';
import { currentPageState, selectedMediaTypeState } from '@media-ui/core/src/state';
import { showUnusedAssetsState } from '@media-ui/feature-asset-usage/src';

import { MainViewState, mainViewState } from '../../state';

const useStyles = createUseMediaUiStyles({
    typeFilter: {},
    selectBox: {
        minWidth: 'auto',
    },
});

const UNUSED_FILTER_VALUE = 'unused';

interface MediaTypeOptions {
    [type: string]: {
        value: AssetType | 'unused';
        label: string;
        icon: string;
    };
}

const TypeFilter: React.FC = () => {
    const classes = useStyles();
    const { featureFlags, assetType } = useMediaUi();
    const [mediaTypeFilter, setMediaTypeFilter] = useRecoilState(selectedMediaTypeState);
    const [showUnusedAssets, setShowUnusedAssets] = useRecoilState(showUnusedAssetsState);
    const setCurrentPage = useSetRecoilState(currentPageState);
    const { translate } = useIntl();
    const mainView = useRecoilValue(mainViewState);

    const currentValue = showUnusedAssets ? UNUSED_FILTER_VALUE : mediaTypeFilter;

    const onValueChange = useCallback(
        (value) => {
            setShowUnusedAssets(value === 'unused');
            if (value !== UNUSED_FILTER_VALUE) {
                setMediaTypeFilter(value);
            }
            setCurrentPage(1);
        },
        [setCurrentPage, setShowUnusedAssets, setMediaTypeFilter]
    );

    const mediaTypeOptions = useMemo((): MediaTypeOptions => {
        const options = {
            video: {
                value: 'video' as AssetType,
                label: translate('typeFilter.mediaType.values.video', 'Video'),
                icon: 'file-video',
                disabled: assetType !== 'all' && assetType !== 'video',
            },
            audio: {
                value: 'audio' as AssetType,
                label: translate('typeFilter.mediaType.values.audio', 'Audio'),
                icon: 'file-audio',
                disabled: assetType !== 'all' && assetType !== 'audio',
            },
            image: {
                value: 'image' as AssetType,
                label: translate('typeFilter.mediaType.values.image', 'Images'),
                icon: 'file-image',
                disabled: assetType !== 'all' && assetType !== 'image',
            },
            // TODO: The Media API currently only knows "Document" internally which is not a valid mimetype
            document: {
                value: 'document' as AssetType,
                label: translate('typeFilter.mediaType.values.document', 'Document'),
                icon: 'file',
                disabled: assetType !== 'all' && assetType !== 'document',
            },
        };

        if (featureFlags.queryAssetUsage) {
            options[UNUSED_FILTER_VALUE] = {
                value: UNUSED_FILTER_VALUE,
                label: translate('typeFilter.mediaType.values.unused', 'Unused'),
                icon: 'fab fa-creative-commons-zero',
                disabled: assetType !== 'all',
            };
        }

        return options;
    }, [translate, featureFlags, assetType]);

    if (![MainViewState.DEFAULT, MainViewState.UNUSED_ASSETS].includes(mainView)) return null;

    return (
        <div className={classes.typeFilter}>
            <SelectBox
                className={classes.selectBox}
                options={Object.values(mediaTypeOptions)}
                onValueChange={onValueChange}
                value={currentValue}
                allowEmpty={assetType === 'all'}
                placeholderIcon="photo-video"
                placeholder={translate('typeFilter.mediaType.values.all', 'All')}
                optionValueField="value"
            />
        </div>
    );
};

export default React.memo(TypeFilter);
