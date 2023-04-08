import React, { useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { SelectBox } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi } from '@media-ui/core';
import {
    currentPageState,
    featureFlagsState,
    selectedAssetTypeState,
    selectedMediaTypeState,
} from '@media-ui/core/src/state';
import { showUnusedAssetsState } from '@media-ui/feature-asset-usage';

import { MainViewMode, mainViewState } from '../../state';

const UNUSED_FILTER_VALUE = 'unused';

interface AssetTypeOptions {
    [type: string]: {
        value: AssetType | 'unused';
        label: string;
        icon: string;
    };
}

import classes from './AssetTypeFilter.module.css';

const AssetTypeFilter: React.FC = () => {
    const { assetType } = useMediaUi();
    const featureFlags = useRecoilValue(featureFlagsState);
    const [assetTypeFilter, setAssetTypeFilter] = useRecoilState(selectedAssetTypeState);
    const setMediaTypeFilter = useSetRecoilState(selectedMediaTypeState);
    const [showUnusedAssets, setShowUnusedAssets] = useRecoilState(showUnusedAssetsState);
    const setCurrentPage = useSetRecoilState(currentPageState);
    const { translate } = useIntl();
    const mainView = useRecoilValue(mainViewState);

    const currentValue = showUnusedAssets ? UNUSED_FILTER_VALUE : assetTypeFilter;

    const onValueChange = useCallback(
        (value) => {
            setShowUnusedAssets(value === 'unused');
            if (value !== UNUSED_FILTER_VALUE) {
                setAssetTypeFilter(value);
                setMediaTypeFilter('');
            }
            setCurrentPage(1);
        },
        [setCurrentPage, setShowUnusedAssets, setAssetTypeFilter]
    );

    const assetTypeOptions = useMemo((): AssetTypeOptions => {
        const options = {
            video: {
                value: 'video' as AssetType,
                label: translate('typeFilter.assetType.values.video', 'Video'),
                icon: 'file-video',
                disabled: assetType !== 'all' && assetType !== 'video',
            },
            audio: {
                value: 'audio' as AssetType,
                label: translate('typeFilter.assetType.values.audio', 'Audio'),
                icon: 'file-audio',
                disabled: assetType !== 'all' && assetType !== 'audio',
            },
            image: {
                value: 'image' as AssetType,
                label: translate('typeFilter.assetType.values.image', 'Image'),
                icon: 'file-image',
                disabled: assetType !== 'all' && assetType !== 'image',
            },
            // TODO: The Media API currently only knows "Document" internally which is not a valid mimetype, we should "translate" this value on the internal API side and only use "application"
            document: {
                value: 'document' as AssetType,
                label: translate('typeFilter.assetType.values.document', 'Document'),
                icon: 'file',
                disabled: assetType !== 'all' && assetType !== 'document',
            },
        };

        // TODO: Move the unused filter into the collection tree as "smart/pseudo collection"
        if (featureFlags.queryAssetUsage) {
            options[UNUSED_FILTER_VALUE] = {
                value: UNUSED_FILTER_VALUE,
                label: translate('typeFilter.assetType.values.unused', 'Unused'),
                icon: 'fab fa-creative-commons-zero',
                disabled: assetType !== 'all',
            };
        }

        return options;
    }, [translate, featureFlags, assetType]);

    if (![MainViewMode.DEFAULT, MainViewMode.UNUSED_ASSETS].includes(mainView)) return null;

    return (
        <div className={classes.typeFilter}>
            <SelectBox
                className={classes.selectBox}
                options={Object.values(assetTypeOptions)}
                onValueChange={onValueChange}
                value={currentValue}
                allowEmpty={assetType === 'all'}
                placeholderIcon="photo-video"
                placeholder={translate('typeFilter.assetType.values.all', 'All')}
                optionValueField="value"
            />
        </div>
    );
};

export default React.memo(AssetTypeFilter);
