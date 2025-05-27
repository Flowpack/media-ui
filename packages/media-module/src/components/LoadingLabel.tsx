import React from 'react';
import { useRecoilValue } from 'recoil';

import { loadingState } from '@media-ui/core/src/state';

interface LoadingLabelProps {
    loadingText: string;
    emptyText: string;
}

const LoadingLabel: React.FC<LoadingLabelProps> = ({ loadingText, emptyText }: LoadingLabelProps) => {
    const isLoading = useRecoilValue(loadingState);
    return <div className="loadingLabel">{isLoading ? loadingText : emptyText}</div>;
};

export default React.memo(LoadingLabel);
