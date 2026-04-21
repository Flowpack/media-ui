import * as React from 'react';
import { useRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';

import { UPLOAD_TYPE, uploadDialogState } from '../state/uploadDialogState';

interface AssetReplacementButtonProps {
    variant?: 'button' | 'menuItem';
    menuItemClassName?: string;
}

const AssetReplacementButton: React.FC<AssetReplacementButtonProps> = ({ variant = 'button', menuItemClassName }) => {
    const [dialogState, setDialogState] = useRecoilState(uploadDialogState);
    const { translate } = useIntl();
    const label = translate('assetReplacement.toggle', 'Replace asset');

    if (variant === 'menuItem') {
        return (
            <li
                className={menuItemClassName}
                onClick={() => setDialogState({ visible: true, uploadType: UPLOAD_TYPE.update })}
            >
                <Icon icon="exchange-alt" />
                <span>{label}</span>
            </li>
        );
    }

    return (
        <Button
            size="regular"
            style={dialogState.visible && dialogState.uploadType === UPLOAD_TYPE.update ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setDialogState({ visible: true, uploadType: UPLOAD_TYPE.update })}
            title={label}
        >
            <Icon icon="exchange-alt" />
        </Button>
    );
};

export default React.memo(AssetReplacementButton);
