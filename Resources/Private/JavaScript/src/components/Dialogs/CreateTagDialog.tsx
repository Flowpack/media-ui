import * as React from 'react';
import { useRecoilState } from 'recoil';

import { Button, Dialog } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useNotify } from '../../core';
import { useCallback } from 'react';
import { createTagDialogState } from '../../state';

const useStyles = createUseMediaUiStyles(() => ({
    createTagForm: {}
}));

const CreateTagDialog: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const Notify = useNotify();
    const [dialogState, setDialogState] = useRecoilState(createTagDialogState);
    const createPossible = true;

    const handleRequestClose = useCallback(() => setDialogState({ visible: false }), [setDialogState]);
    const handleCreate = useCallback(() => {
        Notify.warning('Not implemented, fool!');
    }, [Notify]);

    return (
        <Dialog
            isOpen={dialogState.visible}
            title={translate('uploadDialog.title', 'Upload assets')}
            onRequestClose={() => handleRequestClose()}
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={handleRequestClose}>
                    {translate('uploadDialog.cancel', 'Cancel')}
                </Button>,
                <Button
                    key="upload"
                    style="success"
                    hoverStyle="success"
                    disabled={!createPossible}
                    onClick={() => handleCreate()}
                >
                    {translate('createTagDialog.create', 'Create')}
                </Button>
            ]}
            style="wide"
        >
            <section className={classes.createTagForm}>New tag?</section>
        </Dialog>
    );
};

export default React.memo(CreateTagDialog);
