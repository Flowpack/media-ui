import * as React from 'react';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '../../core';
import { uploadDialogState } from '../../state';
import { useSetRecoilState } from 'recoil';

export default function UploadButton() {
    const { translate } = useIntl();
    const setUploadDialogState = useSetRecoilState(uploadDialogState);

    return (
        <div>
            <Button
                size="regular"
                style="lighter"
                hoverStyle="brand"
                onClick={() => setUploadDialogState({ visible: true })}
            >
                <Icon icon="upload" /> {translate('uploadButton.label', 'Upload')}
            </Button>
        </div>
    );
}
