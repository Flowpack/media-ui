import { atom, AtomEffect } from 'recoil';

type SetErrorRedirectUrlState = (value: string) => void;

let externalSetErrorRedirectUrlState: SetErrorRedirectUrlState | null = null;

export const setErrorRiderectUrlStateExternal: SetErrorRedirectUrlState = (value) => {
    externalSetErrorRedirectUrlState?.(value);
};

const registerExternalSetter: AtomEffect<string> = ({ setSelf }) => {
    externalSetErrorRedirectUrlState = setSelf;
    return () => {
        externalSetErrorRedirectUrlState = null;
    };
};

export const errorRedirectUrlState = atom<string>({
    key: 'errorRedirectUrl',
    default: '',
    effects: [registerExternalSetter],
});
