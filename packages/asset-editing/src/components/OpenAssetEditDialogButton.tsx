import * as React from 'react';
import { useSetRecoilState } from 'recoil';

import { useIntl } from '@media-ui/core';
import { ActionButton } from '@media-ui/core/src/components';

import editAssetDialogState from '../state/editAssetDialogState';

interface OpenAssetEditDialogButtonProps {
    hideLabel?: boolean;
    className?: string;
}

const OpenAssetEditDialogButton: React.FC<OpenAssetEditDialogButtonProps> = ({ hideLabel, className }) => {
    const setDialogVisible = useSetRecoilState(editAssetDialogState);
    const { translate } = useIntl();
    const label = translate('openAssetEditDialogButton.open', 'Rename asset');

    return (
        <ActionButton
            icon="edit"
            label={label}
            hideLabel={hideLabel}
            className={className}
            onClick={() => setDialogVisible(true)}
        />
    );
};

export default React.memo(OpenAssetEditDialogButton);
