import { atom } from 'recoil';

import { SelectionConstraints } from '../interfaces';

export const constraintsState = atom<SelectionConstraints>({
    key: 'ConstraintsState',
    default: {
        assetSources: [],
        mediaTypes: [],
    },
});
