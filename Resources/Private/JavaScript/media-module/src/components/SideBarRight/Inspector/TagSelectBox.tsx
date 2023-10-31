import React, { useCallback, useMemo, useState } from 'react';

import { Headline, MultiSelectBox } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { IconLabel } from '@media-ui/core/src/components';

import * as classes from './CollectionSelectBox.module.css';
import { CollectionOption } from './AssetCollectionOptionPreviewElement';

interface TagSelectBoxProps {
    values: string[];
    options: Tag[];
    onChange: (tags: Tag[]) => void;
    disabled?: boolean;
}

const TagSelectBox = ({ values, options, onChange, disabled = false }: TagSelectBoxProps) => {
    const { translate } = useIntl();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSelectBoxOptions: CollectionOption[] = useMemo(
        () => options.filter(({ label }) => label.toLowerCase().includes(searchTerm)),
        [options, searchTerm]
    );

    const handleChange = (tagIds) => onChange(tagIds.map((tagId) => options.find((o) => o.id === tagId)));

    const handleSearchTermChange = useCallback((searchTerm) => {
        setSearchTerm(searchTerm.toLowerCase());
    }, []);

    return (
        <div className="tagSelectBox">
            <Headline type="h2">
                <IconLabel icon="tags" label={translate('inspector.tags', 'Tags')} />
            </Headline>
            <MultiSelectBox
                className={classes.collectionSelectBox}
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
