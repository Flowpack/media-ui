import * as React from 'react';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';

import { uploadDialogVisibleState } from '../../state';
import { useSetRecoilState } from 'recoil';

export default function UploadButton() {
    const { translate } = useIntl();
    const setUploadDialogState = useSetRecoilState(uploadDialogVisibleState);

    return (
        <div>
            <Button size="regular" style="lighter" hoverStyle="brand" onClick={() => setUploadDialogState(true)}>
                <Icon icon="upload" /> {translate('uploadButton.label', 'Upload')}
            </Button>
        </div>
    );
}
