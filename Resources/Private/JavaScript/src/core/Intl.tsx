import * as React from 'react'
import { createContext, useContext, useState } from 'react'

interface ProviderProps {
  children: React.ReactElement
}

export const IntlContext = createContext({})
export const useIntl = () => useContext(IntlContext)

export function IntlProvider({ children }: ProviderProps) {
  const [locale, setLocale] = useState('en')
  const [messages, setMessages] = useState({})

  const formatMessage = id => {
    return messages[locale] && messages[locale][id]
  }

  return (
    <IntlContext.Provider key={locale} value={{ locale, formatMessage, setLocale }}>
      {children}
    </IntlContext.Provider>
  )
}
