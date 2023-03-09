import * as React from 'react';

import { Headline, MultiSelectBox } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles } from '@media-ui/core/src';
import { Tag } from '@media-ui/feature-asset-tags';

import { IconLabel } from '../../Presentation';

const useStyles = createUseMediaUiStyles({
    tagSelectBox: {},
    tagSelection: {},
});

interface TagSelectBoxProps {
    values: string[];
    options: Tag[];
    onChange: (tags: Tag[]) => void;
    disabled?: boolean;
}

const TagSelectBox = ({ values, options, onChange, disabled = false }: TagSelectBoxProps) => {
    const classes = useStyles();
    const { translate } = useIntl();

    const handleChange = (tagIds) => onChange(tagIds.map((tagId) => options.find((o) => o.id === tagId)));

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
                optionValueField="id"
                options={options}
                searchOptions={options}
                onValuesChange={handleChange}
            />
        </div>
    );
};

export default React.memo(TagSelectBox);
