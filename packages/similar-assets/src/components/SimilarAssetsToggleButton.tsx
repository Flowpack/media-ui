import * as React from 'react';
import { useRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';

import similarAssetsModalState from '../state/similarAssetsModalState';

interface SimilarAssetsToggleButtonProps {
    variant?: 'button' | 'menuItem';
    menuItemClassName?: string;
}

const SimilarAssetsToggleButton: React.FC<SimilarAssetsToggleButtonProps> = ({
    variant = 'button',
    menuItemClassName,
}) => {
    const [similarAssetsModalOpen, setSimilarAssetsModalOpen] = useRecoilState(similarAssetsModalState);
    const { translate } = useIntl();
    const label = translate('similarAssetsModal.show', 'Show similar assets');

    if (variant === 'menuItem') {
        return (
            <li className={menuItemClassName} onClick={() => setSimilarAssetsModalOpen(true)}>
                <Icon icon="equals" />
                <span>{label}</span>
            </li>
        );
    }

    return (
        <Button
            size="regular"
            style={similarAssetsModalOpen ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setSimilarAssetsModalOpen(true)}
            title={label}
        >
            <Icon icon="equals" />
        </Button>
    );
};

export default React.memo(SimilarAssetsToggleButton);
