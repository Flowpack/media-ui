import { atom } from 'recoil';
import { localStorageEffect } from '@media-ui/media-module/src/core/PersistentStateManager';

const selectedTagIdState = atom<string>({
    key: 'SelectedTagIdState',
    default: null,
    effects: [localStorageEffect('SelectedTagIdState')],
});

export default selectedTagIdState;
