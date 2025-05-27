import * as React from 'react';
import { createContext, useContext } from 'react';

interface ProviderProps extends I18nRegistry {
    children: React.ReactElement;
    translate: TranslateFunction;
}

interface ProviderValues extends I18nRegistry {
    translate: TranslateFunction;
}

export const IntlContext = createContext(null);
export const useIntl = (): ProviderValues => useContext(IntlContext);

export function IntlProvider({ children, translate }: ProviderProps) {
    return <IntlContext.Provider value={{ translate }}>{children}</IntlContext.Provider>;
}
