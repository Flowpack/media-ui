import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import cx from 'classnames';

import { useIntl } from '@media-ui/core';
import { IconLabel } from '@media-ui/core/src/components';
import { selectedAssetTypeState, selectedMediaTypeState } from '@media-ui/core/src/state';

import { MainViewMode, mainViewState } from '../../../state';
import MediaTypeFilter from './MediaTypeFilter';
import AssetTypeFilter from './AssetTypeFilter';

import classes from './AssetsFilter.module.css';
import { showUnusedAssetsState } from '@media-ui/feature-asset-usage/src/index';

const AssetsFilter: React.FC = () => {
    const { translate } = useIntl();
    const mainView = useRecoilValue(mainViewState);
    const assetTypeFilter = useRecoilValue(selectedAssetTypeState);
    const mediaTypeFilter = useRecoilValue(selectedMediaTypeState);
    const showUnusedAssets = useRecoilValue(showUnusedAssetsState);
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
            className={cx(classes.assetsFilter, (assetTypeFilter || mediaTypeFilter || showUnusedAssets) && classes.active)}
        >
            <summary title={translate('assetsFilter.title', 'Toggle asset filters')}>
                <IconLabel icon="filter" label={translate('assetsFilter.filter', 'Filter')} />
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
