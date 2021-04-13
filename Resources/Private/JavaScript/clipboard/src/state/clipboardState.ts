import { atom } from 'recoil';

const clipboardState = atom({
    key: 'clipboardState',
    default: {
        visible: false,
    },
});

export default clipboardState;
