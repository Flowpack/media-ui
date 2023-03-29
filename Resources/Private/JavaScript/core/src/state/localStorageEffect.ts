/**
 * This is a custom recoil storage effect that allows us to persist state in local storage.
 * It can be added to any atom as effect.
 */
const STORAGE_PREFIX = 'flowpack.mediaui';

export const localStorageEffect =
    (key: string) =>
    ({ setSelf, onSet }) => {
        const fullKey = `${STORAGE_PREFIX}.${key}`;
        const savedValue = localStorage.getItem(fullKey);
        if (savedValue != null) {
            setSelf(JSON.parse(savedValue));
        }

        onSet((newValue, _, isReset) => {
            isReset ? localStorage.removeItem(fullKey) : localStorage.setItem(fullKey, JSON.stringify(newValue));
        });
    };
