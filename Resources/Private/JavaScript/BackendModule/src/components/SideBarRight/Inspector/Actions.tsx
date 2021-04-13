import * as React from 'react';

import { Button } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    actions: {
        display: 'flex',
        position: 'sticky',
        backgroundColor: theme.colors.mainBackground,
        bottom: 0,
        '& > *': {
            flex: 1,
        },
    },
}));

const Actions = ({
    hasUnpublishedChanges,
    handleApply,
    handleDiscard,
}: {
    hasUnpublishedChanges: boolean;
    handleApply: () => void;
    handleDiscard: () => void;
}) => {
    const classes = useStyles();
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
                disabled={!hasUnpublishedChanges}
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
