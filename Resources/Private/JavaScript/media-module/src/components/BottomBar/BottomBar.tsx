import React from 'react';
import cx from 'classnames';

import { useMediaUi } from '@media-ui/core';
import { ClipboardToggle } from '@media-ui/feature-clipboard';

import AssetCount from './AssetCount/AssetCount';
import Pagination from './Pagination/Pagination';

import classes from './BottomBar.module.css';

const BottomBar: React.FC = () => {
    const { isInNodeCreationDialog, selectionMode } = useMediaUi();
    const components = [AssetCount, Pagination, ClipboardToggle];

    return (
        <div
            className={cx(classes.bottomBar, {
                [classes.selectionMode]: isInNodeCreationDialog || selectionMode,
                [classes.isInNodeCreationDialog]: isInNodeCreationDialog,
            })}
        >
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
};

export default React.memo(BottomBar);
