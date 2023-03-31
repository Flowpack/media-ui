import { atom } from 'recoil';
import { localStorageEffect } from './localStorageEffect';

export const selectedInspectorViewState = atom<null | 'asset' | 'assetCollection' | 'tag'>({
    key: 'SelectedInspectorViewState',
    default: null,
    // TODO: Add validator to make sure we can display the selected inspector view
    effects: [localStorageEffect('SelectedInspectorViewState')],
});
