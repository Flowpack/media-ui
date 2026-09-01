import { atomFamily } from 'recoil';
import { localStorageEffect } from '@media-ui/core/src/state';

const selectedTagIdState = atomFamily<TagId | null, AssetSourceId>({
    key: 'SelectedTagIdState',
    default: null,
    effects: [localStorageEffect('SelectedTagIdState')],
});

export default selectedTagIdState;
