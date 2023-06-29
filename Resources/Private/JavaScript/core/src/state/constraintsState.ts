import { atom } from 'recoil';

export const constraintsState = atom<SelectionConstraints>({
    key: 'ConstraintsState',
    default: {
        assetSources: [],
        mediaTypes: [],
    },
});
