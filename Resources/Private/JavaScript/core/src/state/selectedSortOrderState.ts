import { atom } from 'recoil';

import { localStorageEffect } from './localStorageEffect';

export enum SORT_BY {
    Name = 'name',
    LastModified = 'lastModified',
    Size = 'size',
}

export enum SORT_DIRECTION {
    Asc = 'ASC',
    Desc = 'DESC',
}

export interface SortOrder {
    sortBy: SORT_BY;
    sortDirection: SORT_DIRECTION;
}

export const selectedSortOrderState = atom<SortOrder>({
    key: 'selectedSortOrderState',
    default: {
        sortBy: SORT_BY.LastModified,
        sortDirection: SORT_DIRECTION.Desc,
    },
    effects: [localStorageEffect('selectedSortOrderState')],
});
