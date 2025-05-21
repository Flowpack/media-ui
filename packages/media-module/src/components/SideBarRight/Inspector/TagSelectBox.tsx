import React, { useCallback, useMemo, useState } from 'react';

import { Headline, MultiSelectBox } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { IconLabel } from '@media-ui/core/src/components';

import * as classes from './TagSelectBox.module.css';

interface TagSelectBoxProps {
    values: string[];
    options: Tag[];
    onChange: (tags: Tag[]) => void;
    disabled?: boolean;
}

interface TagOption {
    label: string;
    id: string;
}

const TagSelectBox = ({ values, options, onChange, disabled = false }: TagSelectBoxProps) => {
    const { translate } = useIntl();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSelectBoxOptions: TagOption[] = useMemo(
        () => options.filter(({ label }) => label.toLowerCase().includes(searchTerm.toLowerCase())),
        [options, searchTerm]
    );

    const handleChange = (tagIds) => onChange(tagIds.map((tagId) => options.find((o) => o.id === tagId)));

    const handleSearchTermChange = useCallback((searchTerm) => {
        setSearchTerm(searchTerm);
    }, []);

    return (
        <div className="tagSelectBoxWrapper">
            <Headline type="h2">
                <IconLabel icon="tags" label={translate('inspector.tags', 'Tags')} />
            </Headline>
            <MultiSelectBox
                className={classes.tagSelectBox}
                disabled={disabled}
                placeholder={translate('inspector.tags.placeholder', 'Select a tag')}
                noMatchesFoundLabel={translate('general.noMatchesFound', 'No matches found')}
                values={values}
                optionValueField="id"
                options={options}
                searchOptions={filteredSelectBoxOptions}
                onValuesChange={handleChange}
                searchTerm={searchTerm}
                onSearchTermChange={handleSearchTermChange}
                displaySearchBox
                allowEmpty
                threshold={0}
            />
        </div>
    );
};

export default React.memo(TagSelectBox);
