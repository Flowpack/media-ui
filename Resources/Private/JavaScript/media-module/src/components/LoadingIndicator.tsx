import React from 'react';
import { useRecoilValue } from 'recoil';

import { loadingState } from '@media-ui/core/src/state';

import classes from './LoadingIndicator.module.css';

export default function LoadingIndicator() {
    const isLoading = useRecoilValue(loadingState);

    return isLoading ? (
        <div className={classes.container}>
            <div className={classes.indicator}>
                <div className={classes.bar} />
            </div>
        </div>
    ) : null;
}
