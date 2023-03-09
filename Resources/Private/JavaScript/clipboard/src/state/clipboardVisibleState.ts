import { atom } from 'recoil';

const clipboardVisibleState = atom({
    key: 'clipboardState',
    default: false,
    // effects: [
    //     (data) => {
    //         debugger;
    //     },
    // ],
});

export default clipboardVisibleState;
