'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { DbProvider } from './lib/db-context'

type ProvidersProps = ThemeProviderProps

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      <DbProvider>
        {children}
      </DbProvider>
    </NextThemesProvider>
  )
}
