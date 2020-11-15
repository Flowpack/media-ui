import * as React from 'react';

import { Headline, MultiSelectBox } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '../../../core';
import { IconLabel } from '../../Presentation';

const useStyles = createUseMediaUiStyles({
    tagSelectBox: {},
    tagSelection: {}
});

interface TagSelectBoxProps {
    values: string[];
    options: { label: string }[];
    onChange: (tagNames: string[]) => void;
    disabled?: boolean;
}

const TagSelectBox = ({ values, options, onChange, disabled = false }: TagSelectBoxProps) => {
    const classes = useStyles();
    const { translate } = useIntl();

    return (
        <div className={classes.tagSelectBox}>
            <Headline type="h2">
                <IconLabel icon="tags" label={translate('inspector.tags', 'Tags')} />
            </Headline>
            <MultiSelectBox
                className={classes.tagSelection}
                disabled={disabled}
                placeholder={translate('inspector.tags.placeholder', 'Select a tag')}
                noMatchesFoundLabel={translate('general.noMatchesFound', 'No matches found')}
                values={values}
                optionValueField="label"
                options={options}
                searchOptions={options}
                onValuesChange={onChange}
            />
        </div>
    );
};

export default React.memo(TagSelectBox);
