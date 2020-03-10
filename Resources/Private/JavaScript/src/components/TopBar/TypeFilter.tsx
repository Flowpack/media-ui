import React = require('react');
import { createUseMediaUiStyles, useMediaUi, useIntl } from '../../core';
import { MediaUiTheme } from '../../interfaces';

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

    const handleSelect = ({ target }) => {
        setAssetTypeFilter(assetTypes.find(assetType => assetType.label === target.value));
    };

    return (
        <div className={classes.typeFilter}>
            <label>{translate('filter.type.label', 'Filter by type')}</label>
            <select onChange={e => handleSelect(e)} value={assetTypeFilter?.label}>
                {assetTypes.map(assetType => (
                    <option key={assetType.label} value={assetType.label}>
                        {translate(`assetType.${assetType.label}`, assetType.label)}
                    </option>
                ))}
            </select>
        </div>
    );
}
