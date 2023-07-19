import { atom } from 'recoil';

export const applicationContextState = atom<ApplicationContext>({
    key: 'applicationContext',
    default: 'browser',
});
