import React = require('react');
import { createUseMediaUiStyles } from '../../core/MediaUiThemeProvider';
import MediaUiTheme from '../../interfaces/MediaUiTheme';
import { useMediaUi } from '../../core/MediaUi';
import { useIntl } from '../../core/Intl';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    typeFilter: {
        display: 'flex',
        alignItems: 'baseline',
        '.neos & label': {
            marginRight: '.5rem'
        }
    }
}));

export default function TypeFilter() {
    const classes = useStyles();
    const { assetTypes, assetTypeFilter, setAssetTypeFilter } = useMediaUi();
    const { translate } = useIntl();

    const handleSelect = event => {
        console.log(event.target.value, 'set filter');
        setAssetTypeFilter(assetTypes.find(assetType => assetType.label === event.target.value));
    };

    return (
        <div className={classes.typeFilter}>
            <label>Filter by type</label>
            <select onChange={handleSelect} defaultValue={assetTypeFilter?.label}>
                {assetTypes.map(assetType => (
                    <option key={assetType.label} value={assetType.label}>
                        {translate(`assetType.${assetType.label}`, assetType.label)}
                    </option>
                ))}
            </select>
        </div>
    );
}
