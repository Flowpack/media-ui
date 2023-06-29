import { atom } from 'recoil';

import { localStorageEffect } from '@media-ui/core/src/state';

export enum VIEW_MODES {
    Thumbnails = 'thumbnails',
    List = 'list',
}

export const viewModeState = atom<VIEW_MODES>({
    key: 'ViewModeState',
    default: VIEW_MODES.Thumbnails,
    effects: [localStorageEffect('ViewModeState')],
});
