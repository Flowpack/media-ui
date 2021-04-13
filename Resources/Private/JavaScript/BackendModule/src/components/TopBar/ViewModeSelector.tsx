import * as React from 'react';
import { useMemo } from 'react';

import { SelectBox } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';

import { VIEW_MODES, useViewModeSelection } from '../../hooks';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    viewModeSelector: {
        display: 'flex',
        alignItems: 'baseline',
        '& label': {
            marginRight: theme.spacing.quarter,
        },
    },
}));

const ViewModeSelector: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const [viewModeSelection, setViewModeSelection] = useViewModeSelection();

    const viewModeOptions = useMemo(() => {
        return [
            {
                value: VIEW_MODES.Thumbnails,
                label: translate(`viewModeSelector.viewMode.${VIEW_MODES.Thumbnails}`, 'Thumbnails'),
                icon: 'th',
            },
            {
                value: VIEW_MODES.List,
                label: translate(`viewModeSelector.viewMode.${VIEW_MODES.List}`, 'List'),
                icon: 'th-list',
            },
        ];
    }, [translate]);

    return (
        <div className={classes.viewModeSelector}>
            <SelectBox
                options={viewModeOptions}
                onValueChange={(value) => setViewModeSelection(value)}
                value={viewModeSelection}
                optionValueField="value"
            />
        </div>
    );
};

export default React.memo(ViewModeSelector);
