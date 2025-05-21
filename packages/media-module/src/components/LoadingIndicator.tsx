import React from 'react';
import { useRecoilValue } from 'recoil';

import { loadingState } from '@media-ui/core/src/state';

import classes from './LoadingIndicator.module.css';

const LoadingIndicator: React.FC = () => {
    const isLoading = useRecoilValue(loadingState);

    return <div className={classes.indicator} data-animated={isLoading} role="progressbar" aria-hidden={true}></div>;
};

export default LoadingIndicator;
