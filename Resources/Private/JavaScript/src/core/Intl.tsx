import * as React from 'react';
import { createContext, useContext } from 'react';

interface ProviderProps {
    children: React.ReactElement;
    translate: Function;
}

interface ProviderValues {
    translate: (id: string, fallback: string, args?: any[], packageKey?: string, source?: string) => string;
}

export const IntlContext = createContext(null);
export const useIntl = (): ProviderValues => useContext(IntlContext);

export function IntlProvider({ children, translate }: ProviderProps) {
    return <IntlContext.Provider value={{ translate }}>{children}</IntlContext.Provider>;
}
