import { atom } from 'recoil';
import { localStorageEffect } from '@media-ui/core/src/state';

const selectedTagIdState = atom<string>({
    key: 'SelectedTagIdState',
    default: null,
    effects: [localStorageEffect('SelectedTagIdState')],
});

export default selectedTagIdState;
