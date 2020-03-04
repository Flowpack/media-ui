import React = require('react');
import { createUseMediaUiStyles } from '../../core/MediaUiThemeProvider';
import MediaUiTheme from '../../interfaces/MediaUiTheme';
import { useIntl } from '../../core/Intl';
import { SET_VIEW_MODE_SELECTION, VIEW_MODE_SELECTION } from '../../queries/ViewModeSelectionQuery';
import { useMutation, useQuery } from '@apollo/react-hooks';

export enum VIEW_MODES {
    Thumbnails = 'thumbnails',
    List = 'list'
}

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    viewModeSelector: {
        display: 'flex',
        alignItems: 'baseline',
        '.neos & label': {
            marginRight: '.5rem'
        }
    }
}));

export default function ViewModeSelector() {
    const classes = useStyles();
    const { translate } = useIntl();

    const viewModeSelectionQuery = useQuery(VIEW_MODE_SELECTION);
    const { viewModeSelection } = viewModeSelectionQuery.data;
    const [setViewModeSelection] = useMutation(SET_VIEW_MODE_SELECTION);

    return (
        <div className={classes.viewModeSelector}>
            <label>{translate('viewModeSelector.label', 'View mode')}</label>
            <select
                onChange={event =>
                    setViewModeSelection({
                        variables: { viewModeSelection: event.target.value }
                    })
                }
                value={viewModeSelection}
            >
                {Object.values(VIEW_MODES).map(viewMode => (
                    <option key={viewMode} value={viewMode}>
                        {translate(`viewModeSelector.viewMode.${viewMode}`, viewMode)}
                    </option>
                ))}
            </select>
        </div>
    );
}
