import * as React from 'react';
import { useRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';

import { uploadDialogVisibleState } from '../state';
import { UPLOAD_TYPE } from '../state/uploadDialogVisibleState';

const AssetReplacementButton: React.FC = () => {
    const [dialogState, setDialogState] = useRecoilState(uploadDialogVisibleState);
    const { translate } = useIntl();

    return (
        <Button
            size="regular"
            style={dialogState.visible && dialogState.uploadType === UPLOAD_TYPE.update ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setDialogState({ visible: true, uploadType: UPLOAD_TYPE.update })}
        >
            <Icon icon="exchange-alt" />
            {translate('assetReplacement.toggle', 'Replace asset')}
        </Button>
    );
};

export default React.memo(AssetReplacementButton);
