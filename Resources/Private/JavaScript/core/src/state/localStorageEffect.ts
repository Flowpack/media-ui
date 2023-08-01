/**
 * This is a custom recoil storage effect that allows us to persist state in local storage.
 * It can be added to any atom as effect.
 *
 * If the context parameter is supplied custom behaviour is used to prevent reading and/or writing the state
 * as only the 'browser' context should have complete control over state.
 *
 * TODO: Refactor the context to be more explicit about what is allowed and what is not
 */
const STORAGE_PREFIX = 'flowpack.mediaui';

// TODO: Listen to storage events to allow syncing two tabs
export function localStorageEffect<T = any>(
    key: string,
    validate?: (value: T | undefined) => T,
    context?: ApplicationContext
) {
    return ({ setSelf, onSet }) => {
        // Don't read or write the state in details screen
        if (context == 'details') {
            return;
        }
        const fullKey = `${STORAGE_PREFIX}.${key}`;
        const savedValueJSON = localStorage.getItem(fullKey);
        if (savedValueJSON != null) {
            try {
                let savedValue = JSON.parse(savedValueJSON);
                if (validate) {
                    savedValue = validate(savedValue);
                }
                if (savedValue !== null && savedValue !== undefined) {
                    setSelf(savedValue);
                }
            } catch (e) {
                console.warn(`[MEDIA UI]: Could not parse saved value for stored setting ${fullKey}`);
                localStorage.removeItem(fullKey);
            }
        }
        onSet((newValue: T, previousValue: T | undefined, isReset: boolean) => {
            // Don't write the state in selection screen
            if (context == 'selection') {
                return;
            }
            isReset || newValue == '' || newValue == null
                ? localStorage.removeItem(fullKey)
                : localStorage.setItem(fullKey, JSON.stringify(newValue));
        });
    };
}
