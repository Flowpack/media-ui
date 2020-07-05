import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { createUseMediaUiStyles } from '../core';
import { loadingState } from '../state';

const useStyles = createUseMediaUiStyles({
    loadingLabel: {}
});

interface LoadingLabelProps {
    loadingText: string;
    emptyText: string;
}

const LoadingLabel: React.FC<LoadingLabelProps> = ({ loadingText, emptyText }: LoadingLabelProps) => {
    const classes = useStyles();
    const isLoading = useRecoilValue(loadingState);
    return <div className={classes.loadingLabel}>{isLoading ? loadingText : emptyText}</div>;
};

export default React.memo(LoadingLabel);
