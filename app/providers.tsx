'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { DbProvider } from './lib/db-context'
import { AuthProvider } from './lib/authContext' // Importar AuthProvider

type ProvidersProps = ThemeProviderProps

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      <AuthProvider> {/* Envolver com AuthProvider */}
        <DbProvider>
          {children}
        </DbProvider>
      </AuthProvider>
    </NextThemesProvider>
  )
}
