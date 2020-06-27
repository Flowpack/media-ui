import { atom } from 'recoil';

const selectedMediaTypeState = atom<string>({
    key: 'selectedMediaTypeState',
    default: ''
});

export default selectedMediaTypeState;
