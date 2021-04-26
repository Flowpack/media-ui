import * as React from 'react';

import { IconButton } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, MediaUiTheme, useIntl } from '@media-ui/core/src';

import { useViewModeSelection, VIEW_MODES } from '../../hooks';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    viewModeSelector: {
        display: 'flex',
        alignItems: 'baseline',
        '& label': {
            marginRight: theme.spacing.quarter,
        },
    },
    selectBox: {
        minWidth: 'auto',
    },
}));

const ViewModeSelector: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const [viewModeSelection, setViewModeSelection] = useViewModeSelection();

    return (
        <div className={classes.viewModeSelector}>
            <IconButton
                icon={viewModeSelection === VIEW_MODES.List ? 'th' : 'th-list'}
                size="regular"
                title={translate(
                    `viewModeSelector.viewMode.${
                        viewModeSelection === VIEW_MODES.List ? VIEW_MODES.Thumbnails : VIEW_MODES.List
                    }`,
                    `Switch mode`
                )}
                style="neutral"
                hoverStyle="brand"
                onClick={() =>
                    setViewModeSelection(
                        viewModeSelection === VIEW_MODES.List ? VIEW_MODES.Thumbnails : VIEW_MODES.List
                    )
                }
            />
        </div>
    );
};

export default React.memo(ViewModeSelector);
