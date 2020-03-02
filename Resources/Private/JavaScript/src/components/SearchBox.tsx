import * as React from 'react';
import { useIntl } from '../core/Intl';
import { createUseStyles } from 'react-jss';
import { useMediaUiTheme } from '../core/MediaUiThemeProvider';

const useStyles = createUseStyles({
    searchBox: ({ theme }) => ({
        '.neos & input': {
            width: '100%'
        }
    })
});

export default function SearchBox() {
    const theme = useMediaUiTheme();
    const classes = useStyles({ theme });
    const { translate } = useIntl();

    return (
        <div className={classes.searchBox}>
            <input type="search" onSubmit={() => console.log(this.value)} placeholder={translate('searchBox.placeholder', 'Search')} />
        </div>
    );
}
