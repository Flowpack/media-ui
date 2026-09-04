import * as React from 'react';
import { useSetRecoilState } from 'recoil';

import { useIntl } from '@media-ui/core';
import { ActionButton } from '@media-ui/core/src/components';

import { UPLOAD_TYPE, uploadDialogState } from '../state/uploadDialogState';

interface AssetReplacementButtonProps {
    hideLabel?: boolean;
    className?: string;
}

const AssetReplacementButton: React.FC<AssetReplacementButtonProps> = ({ hideLabel, className }) => {
    const setDialogState = useSetRecoilState(uploadDialogState);
    const { translate } = useIntl();
    const label = translate('assetReplacement.toggle', 'Replace asset');

    return (
        <ActionButton
            icon="exchange-alt"
            label={label}
            hideLabel={hideLabel}
            className={className}
            onClick={() => setDialogState({ visible: true, uploadType: UPLOAD_TYPE.update })}
        />
    );
};

export default React.memo(AssetReplacementButton);
