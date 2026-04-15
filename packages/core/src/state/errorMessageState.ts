import { atom, AtomEffect } from 'recoil';

type SetErrorMessageState = (value: string) => void;

let externalSetMessageState: SetErrorMessageState | null = null;

export const setErrorMessageStateExternal: SetErrorMessageState = (value) => {
    externalSetMessageState?.(value);
};

const registerExternalSetter: AtomEffect<string> = ({ setSelf }) => {
    externalSetMessageState = setSelf;
    return () => {
        externalSetMessageState = null;
    };
};

export const errorMessageState = atom<string>({
    key: 'errorMessage',
    default: '',
    effects: [registerExternalSetter],
});
