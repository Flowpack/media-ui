import React from 'react';
import { useSetRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';

import { UPLOAD_TYPE, uploadDialogState } from '../state/uploadDialogState';

import classes from './UploadButton.module.css';

export default function UploadButton() {
    const { translate } = useIntl();
    const setUploadDialogState = useSetRecoilState(uploadDialogState);

    return (
        <div className={classes.uploadButton}>
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
