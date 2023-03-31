import React, { useCallback, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { SelectBox, IconButton } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi } from '@media-ui/core';

import { selectedSortOrderState, SORT_BY, SORT_DIRECTION } from '@media-ui/core/src/state/selectedSortOrderState';

import classes from './SortOrderSelector.module.css';

interface SortByOption {
    value: SORT_BY;
    label: string;
    icon: string;
}

const SortOrderSelector: React.FC = () => {
    const { isInNodeCreationDialog, selectionMode } = useMediaUi();
    const [sortOrderState, setSortOrderState] = useRecoilState(selectedSortOrderState);
    const { translate } = useIntl();
    const hideOptionIcon = isInNodeCreationDialog || selectionMode;
    const handleChangeSortBy = useCallback(
        (sortBy: SORT_BY) => {
            setSortOrderState({ ...sortOrderState, sortBy });
        },
        [sortOrderState, setSortOrderState]
    );

    const handleSwitchSortDirection = useCallback(() => {
        setSortOrderState({
            ...sortOrderState,
            sortDirection:
                sortOrderState.sortDirection === SORT_DIRECTION.Asc ? SORT_DIRECTION.Desc : SORT_DIRECTION.Asc,
        });
    }, [sortOrderState, setSortOrderState]);

    const sortByOptions: SortByOption[] = useMemo(() => {
        return [
            {
                value: SORT_BY.LastModified,
                label: translate('sortingState.sortBy.values.lastModified', 'Last Modified'),
                icon: hideOptionIcon ? '' : 'calendar',
            },
            {
                value: SORT_BY.Name,
                label: translate('sortingState.sortBy.values.name', 'Name'),
                icon: hideOptionIcon ? '' : 'font',
            },
        ];
    }, [translate, hideOptionIcon]);

    return (
        <div className={classes.sortingState}>
            <div className={classes.selectBox}>
                <SelectBox
                    className={classes.selectBox}
                    options={Object.values(sortByOptions)}
                    onValueChange={handleChangeSortBy}
                    value={sortOrderState.sortBy}
                    optionValueField="value"
                />
            </div>
            <IconButton
                icon={sortOrderState.sortDirection === SORT_DIRECTION.Asc ? 'sort-amount-up' : 'sort-amount-down'}
                size="regular"
                title={translate(
                    `sortingState.dortOrder.value.${
                        sortOrderState.sortDirection === SORT_DIRECTION.Asc ? SORT_DIRECTION.Desc : SORT_DIRECTION.Asc
                    }`,
                    `Switch sort direction`
                )}
                style="neutral"
                hoverStyle="brand"
                onClick={handleSwitchSortDirection}
            />
        </div>
    );
};

export default React.memo(SortOrderSelector);
