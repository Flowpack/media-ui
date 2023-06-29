import React, { useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { SelectBox } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import {
    constraintsState,
    currentPageState,
    featureFlagsState,
    selectedAssetTypeState,
    selectedMediaTypeState,
} from '@media-ui/core/src/state';
import { showUnusedAssetsState } from '@media-ui/feature-asset-usage';

import classes from './AssetsFilter.module.css';

const MediaTypeFilter: React.FC = () => {
    const { translate } = useIntl();
    const { mediaTypeFilterOptions } = useRecoilValue(featureFlagsState);
    const [mediaTypeFilter, setMediaTypeFilter] = useRecoilState(selectedMediaTypeState);
    const assetTypeFilter = useRecoilValue(selectedAssetTypeState);
    const setCurrentPage = useSetRecoilState(currentPageState);
    const showUnusedAssets = useRecoilValue(showUnusedAssetsState);
    const constraints = useRecoilValue(constraintsState);

    const currentValue = mediaTypeFilter;

    const onValueChange = useCallback(
        (value) => {
            setMediaTypeFilter(value);
            setCurrentPage(1);
        },
        [setCurrentPage, setMediaTypeFilter]
    );

    const options = useMemo(() => {
        // TODO: Improve the state definition so that this is not so complicated
        if (!mediaTypeFilterOptions || !assetTypeFilter || showUnusedAssets) return [];

        const optionsByType = mediaTypeFilterOptions[assetTypeFilter];
        return Object.keys(optionsByType)
            .filter((mediaType: MediaType) => !constraints.mediaTypes || constraints.mediaTypes?.includes(mediaType))
            .map((mediaType) => ({
                label: optionsByType[mediaType],
                value: mediaType,
            }));
    }, [assetTypeFilter, constraints.mediaTypes, mediaTypeFilterOptions, showUnusedAssets]);

    if (options.length === 0) return null;

    return (
        <div className={classes.typeFilter}>
            <SelectBox
                className={classes.selectBox}
                options={options}
                onValueChange={onValueChange}
                value={currentValue}
                allowEmpty={!constraints.mediaTypes}
                placeholder={translate('typeFilter.assetType.values.all', 'Mediatype')}
                optionValueField="value"
            />
        </div>
    );
};

export default React.memo(MediaTypeFilter);
