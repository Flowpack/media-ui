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

import { MainViewMode, mainViewState } from '../../state';

interface MediaTypeOptions {
    [type: MediaType]: string;
}

import classes from './AssetTypeFilter.module.css';

// TODO: Move to settings or resolve from actual existing type options of assets in the db and use `MediaTypes` class to create label
const MEDIA_TYPE_OPTIONS: MediaTypeOptions = {
    'image/svg+xml': 'SVG',
    'image/png': 'PNG',
    'image/jpeg': 'JPEG',
    'image/gif': 'GIF',
    'image/webp': 'WEBP',
};

const MediaTypeFilter: React.FC = () => {
    const { translate } = useIntl();
    const { assetType } = useMediaUi();
    const assetTypeFilter = useRecoilValue(selectedAssetTypeState);
    const [mediaTypeFilter, setMediaTypeFilter] = useRecoilState(selectedMediaTypeState);
    const setCurrentPage = useSetRecoilState(currentPageState);
    const mainView = useRecoilValue(mainViewState);

    const currentValue = mediaTypeFilter;

    const onValueChange = useCallback(
        (value) => {
            setMediaTypeFilter(value);
            setCurrentPage(1);
        },
        [setCurrentPage, setMediaTypeFilter]
    );

    const options = useMemo(() => {
        return Object.keys(MEDIA_TYPE_OPTIONS).reduce((carry, mediaType) => {
            // TODO: Convert the document type of the Neos Media API to application internally
            if (
                assetType === 'all' ||
                (assetType === 'document' && mediaType.startsWith('application')) ||
                mediaType.startsWith(assetType)
            ) {
                carry.push({
                    label: MEDIA_TYPE_OPTIONS[mediaType],
                    value: mediaType,
                });
            }
            return carry;
        }, []);
    }, [assetType]);

    if (assetTypeFilter !== 'image') return null;

    return (
        <div className={classes.typeFilter}>
            <SelectBox
                className={classes.selectBox}
                options={options}
                onValueChange={onValueChange}
                value={currentValue}
                allowEmpty={assetType === 'all'}
                placeholderIcon="filter"
                placeholder={translate('typeFilter.assetType.values.all', 'All')}
                optionValueField="value"
            />
        </div>
    );
};

export default React.memo(MediaTypeFilter);
