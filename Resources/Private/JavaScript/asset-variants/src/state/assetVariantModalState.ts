import { atom, useSetRecoilState } from 'recoil';
import selectedVariantIdState from './selectedVariantIdState';

const assetVariantModalState = atom({
    key: 'assetVariantModalState',
    default: false,
});

export default assetVariantModalState;
