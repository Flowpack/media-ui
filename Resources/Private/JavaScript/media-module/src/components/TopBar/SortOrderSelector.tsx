import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { SelectBox, IconButton } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '@media-ui/core/src';

import selectedSortOrderState, { SORT_BY, SORT_DIRECTION } from '@media-ui/core/src/state/selectedSortOrderState';

const useStyles = createUseMediaUiStyles({
    sortingState: {
        display: 'flex',
    },
    selectBox: {
        minWidth: 'auto',
    },
});

interface SortByOption {
    value: SORT_BY;
    label: string;
    icon: string;
}

const SortOrderSelector: React.FC = () => {
    const classes = useStyles();
    const [sortOrderState, setSortOrderState] = useRecoilState(selectedSortOrderState);
    const { translate } = useIntl();

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
                icon: 'calendar',
            },
            {
                value: SORT_BY.Name,
                label: translate('sortingState.sortBy.values.name', 'Name'),
                icon: 'font',
            },
        ];
    }, [translate]);

    return (
        <div className={classes.sortingState}>
            <SelectBox
                className={classes.selectBox}
                options={Object.values(sortByOptions)}
                onValueChange={handleChangeSortBy}
                value={sortOrderState.sortBy}
                optionValueField="value"
            />
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
