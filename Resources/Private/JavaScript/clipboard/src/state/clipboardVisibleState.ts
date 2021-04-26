import { atom } from 'recoil';

const clipboardVisibleState = atom({
    key: 'clipboardState',
    default: false,
});

export default clipboardVisibleState;
