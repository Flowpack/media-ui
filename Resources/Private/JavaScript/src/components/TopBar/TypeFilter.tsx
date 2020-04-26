import * as React from 'react';
import { useMemo } from 'react';
import { SelectBox } from '@neos-project/react-ui-components';
import { createUseMediaUiStyles, useMediaUi, useIntl } from '../../core';
import { MediaUiTheme } from '../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    typeFilter: {}
}));

export default function TypeFilter() {
    const classes = useStyles();
    const { assetTypes, assetTypeFilter, setAssetTypeFilter } = useMediaUi();
    const { translate } = useIntl();

    const handleSelect = (value) => {
        setAssetTypeFilter(assetTypes.find(assetType => assetType.label === value));
    };

    const typeOptions = useMemo(() => {
        return assetTypes.map(({ label }) => {
            return {
                value: label === 'All' ? '' : label,
                label: translate(`assetType.${label.toLowerCase()}`, label),
                icon: label === 'Document' ? 'file' : label === 'All' ? 'photo-video' : `file-${label.toLowerCase()}`
            };
        });
    }, [assetTypes]);

    return (
        <div className={classes.typeFilter}>
            <SelectBox
                options={typeOptions}
                onValueChange={value => handleSelect(value)}
                value={assetTypeFilter?.label || ''}
                optionValueField="value"
            />
        </div>
    );
}
