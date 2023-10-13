import React from 'react';
import cx from 'classnames';

import { useMediaUi } from '@media-ui/core';
import { ClipboardActions } from '@media-ui/feature-clipboard';

import SortOrderSelector from './SortOrderSelector';
import AssetsFilter from './AssetsFilter/AssetsFilter';
import ViewModeSelector from './ViewModeSelector';
import SearchBox from './SearchBox';

import classes from './TopBar.module.css';

const TopBar: React.FC = () => {
    const { selectionMode } = useMediaUi();

    // TODO: Implement and use a component registry
    const components = [ClipboardActions, SearchBox, AssetsFilter, SortOrderSelector, ViewModeSelector];

    return (
        <div className={cx(classes.topBar, selectionMode && classes['topBar--selectionMode'])}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
};

export default React.memo(TopBar);
