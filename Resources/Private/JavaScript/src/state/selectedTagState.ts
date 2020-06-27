import { atom } from 'recoil';
import { Tag } from '../interfaces';

const selectedTagState = atom<Tag>({
    key: 'selectedTagState',
    default: null
});

export default selectedTagState;
