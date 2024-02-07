import * as React from 'react';
import { useRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';

import editAssetDialogState from '../state/editAssetDialogState';

const OpenAssetEditDialogButton: React.FC = () => {
    const [dialogVisible, setDialogVisible] = useRecoilState(editAssetDialogState);
    const { translate } = useIntl();

    return (
        <Button
            size="regular"
            style={dialogVisible ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setDialogVisible(true)}
            title={translate('openAssetEditDialogButton.open', 'Rename asset')}
        >
            <Icon icon="edit" />
        </Button>
    );
};

export default React.memo(OpenAssetEditDialogButton);
