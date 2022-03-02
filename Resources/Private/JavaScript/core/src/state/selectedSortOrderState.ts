import { atom } from 'recoil';

export enum SORT_BY {
    Name = 'name',
    LastModified = 'lastModified',
}
export enum SORT_DIRECTION {
    Asc = 'ASC',
    Desc = 'DESC',
}

export interface SortOrder {
    sortBy: SORT_BY;
    sortDirection: SORT_DIRECTION;
}
const selectedSortOrderState = atom<SortOrder>({
    key: 'selectedSortOrderState',
    default: {
        sortBy: SORT_BY.LastModified,
        sortDirection: SORT_DIRECTION.Desc,
    },
});

export default selectedSortOrderState;
