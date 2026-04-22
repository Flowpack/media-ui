import { atom, AtomEffect } from 'recoil';

type SetErrorTitleState = (value: string) => void;

let externalSetTitleState: SetErrorTitleState | null = null;

export const setErrorTitleStateExternal: SetErrorTitleState = (value) => {
    externalSetTitleState?.(value);
};

const registerExternalSetter: AtomEffect<string> = ({ setSelf }) => {
    externalSetTitleState = setSelf;
    return () => {
        externalSetTitleState = null;
    };
};

export const errorTitleState = atom<string>({
    key: 'errorMessage',
    default: '',
    effects: [registerExternalSetter],
});
