'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { QueryProvider } from '@/app/lib/providers/QueryProvider'
import { AuthProvider } from '@/app/lib/auth'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          {...props}
        >
          <div suppressHydrationWarning>
            {children}
          </div>
        </NextThemesProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
