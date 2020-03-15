import * as React from 'react';
import SelectBox from '@neos-project/react-ui-components/lib-esm/SelectBox';
import { createUseMediaUiStyles, useMediaUi, useIntl } from '../../core';
import { MediaUiTheme } from '../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    importedFilter: {}
}));

export default function ImportedFilter() {
    const classes = useStyles();
    const { filterImported, setFilterImported } = useMediaUi();
    const { translate } = useIntl();

    const typeOptions = [
        {
            value: '',
            label: translate('importedFilter.all', 'All'),
            icon: 'cloud'
        },
        {
            value: 'imported',
            label: translate('importedFilter.imported', 'Imported'),
            icon: 'cloud-download-alt'
        }
    ];

    return (
        <div className={classes.importedFilter}>
            <SelectBox
                options={typeOptions}
                onValueChange={value => setFilterImported(value === 'imported')}
                value={filterImported}
                optionValueField="value"
            />
        </div>
    );
}
