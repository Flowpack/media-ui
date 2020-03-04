import * as React from 'react';
import { createUseMediaUiStyles } from '../../core/MediaUiThemeProvider';
import MediaUiTheme from '../../interfaces/MediaUiTheme';
import { useIntl } from '../../core/Intl';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    searchBox: {
        '.neos & input': {
            width: '100%'
        }
    }
}));

export default function SearchBox() {
    const classes = useStyles();
    const { translate } = useIntl();

    return (
        <div className={classes.searchBox}>
            <input
                type="search"
                onSubmit={() => console.log(this.value)}
                placeholder={translate('searchBox.placeholder', 'Search')}
            />
        </div>
    );
}
