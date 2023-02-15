import { atom } from 'recoil';

const selectedVariantIdState = atom<string>({
    key: 'selectedVariantIdState',
    default: null,
});

export default selectedVariantIdState;
