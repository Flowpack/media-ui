import * as React from 'react';

import { Button, Label, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '../../Intl';
import { createUseMediaUiStyles, MediaUiTheme } from '../../MediaUiTheme';
import { Dialog } from '../../../components';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    dialogBody: {
        padding: 16,
    },
    modalTitle: {
        marginLeft: theme.spacing.full,
    },
    buttonIcon: {
        marginRight: theme.spacing.half,
    },
}));

interface ConfirmProps {
    title: string;
    message: string;
    buttonLabel: string;
    onConfirm: () => void;
    onDeny: () => void;
}

const Confirm: React.FC<ConfirmProps> = ({ title, message, buttonLabel, onConfirm, onDeny }: ConfirmProps) => {
    const classes = useStyles();
    const { translate } = useIntl();

    const handleRequestClose = React.useCallback(() => onDeny(), [onDeny]);
    const handleConfirm = React.useCallback(() => onConfirm(), [onConfirm]);

    return (
        <Dialog
            type="error"
            isOpen={true}
            title={
                <>
                    <Icon icon="exclamation-triangle" />
                    <span className={classes.modalTitle}>{title}</span>
                </>
            }
            onRequestClose={handleRequestClose}
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={handleRequestClose}>
                    {translate('general.cancel', 'Cancel')}
                </Button>,
                <Button key="confirm" style="error" hoverStyle="error" onClick={handleConfirm}>
                    <Icon icon="ban" className={classes.buttonIcon} />
                    {buttonLabel}
                </Button>,
            ]}
        >
            <div className={classes.dialogBody}>
                <Label>{message}</Label>
            </div>
        </Dialog>
    );
};

export default React.memo(Confirm);
