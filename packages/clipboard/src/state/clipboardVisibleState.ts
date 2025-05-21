import { atom } from 'recoil';

export const clipboardVisibleState = atom({
    key: 'clipboardState',
    default: false,
});
