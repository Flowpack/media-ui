import { atom, AtomEffect } from 'recoil';

type SetErrorState = (value: boolean) => void;

let externalSetErrorState: SetErrorState | null = null;

export const setErrorStateExternal: SetErrorState = (value) => {
    externalSetErrorState?.(value);
};

const registerExternalSetter: AtomEffect<boolean> = ({ setSelf }) => {
    externalSetErrorState = setSelf;
    return () => {
        externalSetErrorState = null;
    };
};

export const errorState = atom<boolean>({
    key: 'errorState',
    default: false,
    effects: [registerExternalSetter],
});
