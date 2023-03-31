/**
 * This is a custom recoil storage effect that allows us to persist state in local storage.
 * It can be added to any atom as effect.
 */
const STORAGE_PREFIX = 'flowpack.mediaui';

export function localStorageEffect<T = any>(key: string, validate?: (value: T | undefined) => T) {
    return ({ setSelf, onSet }) => {
        const fullKey = `${STORAGE_PREFIX}.${key}`;
        const savedValueJSON = localStorage.getItem(fullKey);
        if (savedValueJSON != null) {
            let savedValue = JSON.parse(savedValueJSON);
            if (validate) {
                savedValue = validate(savedValue);
            }
            setSelf(savedValue);
        }
        onSet((newValue, previousValue: T | undefined, isReset) => {
            if (!isReset && validate) {
                newValue = validate(newValue);
            }
            isReset ? localStorage.removeItem(fullKey) : localStorage.setItem(fullKey, JSON.stringify(newValue));
        });
    };
}
