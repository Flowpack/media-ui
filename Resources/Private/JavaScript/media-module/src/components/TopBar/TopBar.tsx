import React from 'react';
import cx from 'classnames';

import { useMediaUi } from '@media-ui/core';
import { ClipboardActions } from '@media-ui/feature-clipboard';

import { SearchBox, AssetTypeFilter, ViewModeSelector } from './index';
import SortOrderSelector from './SortOrderSelector';

import classes from './TopBar.module.css';
import MediaTypeFilter from './MediaTypeFilter';

const TopBar: React.FC = () => {
    const { selectionMode } = useMediaUi();

    const components = [
        ClipboardActions,
        SearchBox,
        AssetTypeFilter,
        MediaTypeFilter,
        SortOrderSelector,
        ViewModeSelector,
    ];

    return (
        <div className={cx(classes.topBar, selectionMode && classes.topBarSelectionMode)}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
};

export default React.memo(TopBar);
