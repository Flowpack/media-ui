import * as React from 'react';
import { useSetRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';

import { uploadDialogVisibleState } from '../state';
import { UPLOAD_TYPE } from '../state/uploadDialogVisibleState';

export default function UploadButton() {
    const { translate } = useIntl();
    const setUploadDialogState = useSetRecoilState(uploadDialogVisibleState);

    return (
        <div>
            <Button
                size="regular"
                style="lighter"
                hoverStyle="brand"
                onClick={() => setUploadDialogState({ visible: true, uploadType: UPLOAD_TYPE.new })}
            >
                <Icon icon="upload" /> {translate('uploadButton.label', 'Upload')}
            </Button>
        </div>
    );
}
