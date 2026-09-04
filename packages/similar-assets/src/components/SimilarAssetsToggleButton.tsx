import * as React from 'react';
import { useSetRecoilState } from 'recoil';

import { useIntl } from '@media-ui/core';
import { ActionButton } from '@media-ui/core/src/components';

import similarAssetsModalState from '../state/similarAssetsModalState';

interface SimilarAssetsToggleButtonProps {
    hideLabel?: boolean;
    className?: string;
}

const SimilarAssetsToggleButton: React.FC<SimilarAssetsToggleButtonProps> = ({ hideLabel, className }) => {
    const setSimilarAssetsModalOpen = useSetRecoilState(similarAssetsModalState);
    const { translate } = useIntl();
    const label = translate('similarAssetsModal.show', 'Show similar assets');

    return (
        <ActionButton
            icon="equals"
            label={label}
            hideLabel={hideLabel}
            className={className}
            onClick={() => setSimilarAssetsModalOpen(true)}
        />
    );
};

export default React.memo(SimilarAssetsToggleButton);
