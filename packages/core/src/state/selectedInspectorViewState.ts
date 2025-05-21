import { atomFamily, selector } from 'recoil';
import { localStorageEffect } from './localStorageEffect';
import { applicationContextState } from './applicationContextState';

const selectedInspectorViewForContextState = atomFamily<null | InspectorViewMode, ApplicationContext>({
    key: 'selectedInspectorViewForContextState',
    default: null,
    // TODO: Add validator to make sure we can display the selected inspector view
    effects: (applicationContext) => [localStorageEffect('selectedInspectorViewState', undefined, applicationContext)],
});

export const selectedInspectorViewState = selector<InspectorViewMode>({
    key: 'selectedInspectorViewState',
    get: ({ get }) => get(selectedInspectorViewForContextState(get(applicationContextState))),
    set: ({ get, set }, mode: InspectorViewMode) =>
        set(selectedInspectorViewForContextState(get(applicationContextState)), mode),
});
