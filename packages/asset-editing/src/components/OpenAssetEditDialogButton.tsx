import * as React from 'react';
import { useRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';

import editAssetDialogState from '../state/editAssetDialogState';

interface OpenAssetEditDialogButtonProps {
    variant?: 'button' | 'menuItem';
    menuItemClassName?: string;
}

const OpenAssetEditDialogButton: React.FC<OpenAssetEditDialogButtonProps> = ({
    variant = 'button',
    menuItemClassName,
}) => {
    const [dialogVisible, setDialogVisible] = useRecoilState(editAssetDialogState);
    const { translate } = useIntl();
    const label = translate('openAssetEditDialogButton.open', 'Rename asset');

    if (variant === 'menuItem') {
        return (
            <li className={menuItemClassName} onClick={() => setDialogVisible(true)}>
                <Icon icon="edit" />
                <span>{label}</span>
            </li>
        );
    }

    return (
        <Button
            size="regular"
            style={dialogVisible ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setDialogVisible(true)}
            title={label}
        >
            <Icon icon="edit" />
        </Button>
    );
};

export default React.memo(OpenAssetEditDialogButton);
