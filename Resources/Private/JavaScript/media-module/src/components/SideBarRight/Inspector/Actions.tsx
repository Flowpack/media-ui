import React from 'react';

import { Button } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';

import classes from './Actions.module.css';

interface ActionProps {
    hasUnpublishedChanges: boolean;
    handleApply: () => void;
    handleDiscard: () => void;
    inputValid?: boolean;
}

const Actions: React.FC<ActionProps> = ({ hasUnpublishedChanges, handleApply, handleDiscard, inputValid = true }) => {
    const { translate } = useIntl();
    return (
        <div className={classes.actions}>
            <Button
                disabled={!hasUnpublishedChanges}
                size="regular"
                style="lighter"
                hoverStyle="brand"
                onClick={handleDiscard}
            >
                {translate('inspector.actions.discard', 'Discard')}
            </Button>
            <Button
                disabled={!hasUnpublishedChanges || !inputValid}
                size="regular"
                style="success"
                hoverStyle="success"
                onClick={handleApply}
            >
                {translate('inspector.actions.apply', 'Apply')}
            </Button>
        </div>
    );
};

export default Actions;
