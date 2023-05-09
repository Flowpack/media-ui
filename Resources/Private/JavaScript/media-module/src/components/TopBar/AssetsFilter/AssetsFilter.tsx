import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import cx from 'classnames';

import { IconLabel } from '@media-ui/core/src/components';
import { selectedAssetTypeState, selectedMediaTypeState } from '@media-ui/core/src/state';

import { MainViewMode, mainViewState } from '../../../state';
import MediaTypeFilter from './MediaTypeFilter';
import AssetTypeFilter from './AssetTypeFilter';

import classes from './AssetsFilter.module.css';

const AssetsFilter: React.FC = () => {
    const mainView = useRecoilValue(mainViewState);
    const assetTypeFilter = useRecoilValue(selectedAssetTypeState);
    const mediaTypeFilter = useRecoilValue(selectedMediaTypeState);
    const detailsRef = useRef<HTMLDetailsElement>();

    // TODO: Implement and use a component registry
    const components = [AssetTypeFilter, MediaTypeFilter];

    useEffect(() => {
        // Close the details element when a media type filter is selected
        if (detailsRef.current?.open) {
            detailsRef.current.open = false;
        }
    }, [mediaTypeFilter]);

    if (![MainViewMode.DEFAULT, MainViewMode.UNUSED_ASSETS].includes(mainView)) return null;

    return (
        <details
            ref={detailsRef}
            className={cx(classes.assetsFilter, (assetTypeFilter || mediaTypeFilter) && classes.active)}
        >
            <summary>
                <IconLabel icon="filter" label="Filter" />
            </summary>
            <div className={classes.filterList}>
                {components.map((Component, index) => (
                    <Component key={index} />
                ))}
            </div>
        </details>
    );
};

export default React.memo(AssetsFilter);
