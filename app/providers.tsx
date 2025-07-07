'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { useEffect, useState } from 'react'
import { initializeSync } from './lib/initSync'
import { SyncStatus } from './components/SyncStatus'

export function Providers({ children, ...props }: ThemeProviderProps) {
  const [syncInitialized, setSyncInitialized] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    // Inicializar sincronização após o componente montar
    const initSync = async () => {
      try {
        console.log('🚀 Inicializando sistema de sincronização...')
        const result = await initializeSync()
        
        if (result.success) {
          console.log('✅ Sincronização inicializada:', result.message)
          setSyncInitialized(true)
        } else {
          console.warn('⚠️ Sincronização com problemas:', result.message)
          setSyncError(result.message)
          setSyncInitialized(true) // Ainda marca como inicializado para não tentar novamente
        }
      } catch (error: any) {
        console.error('❌ Erro crítico na inicialização da sincronização:', error)
        setSyncError(error.message)
        setSyncInitialized(true)
      }
    }

    // Delay pequeno para garantir que as stores estejam prontas
    const timer = setTimeout(initSync, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      disableTransitionOnChange
      {...props}
    >
      <div suppressHydrationWarning>
        {children}
        
        {/* Componente de Status de Sincronização */}
        {syncInitialized && (
          <SyncStatus 
            showDetails={true}
            position="top-right"
            className="z-50"
          />
        )}
        
        {/* Mostrar erro de inicialização se houver */}
        {syncError && (
          <div className="fixed bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md">
            <div className="flex">
              <div className="py-1">
                <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold">Problema na Sincronização</p>
                <p className="text-sm">{syncError}</p>
                <p className="text-xs mt-1">A aplicação funcionará normalmente, mas sem sincronização automática.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </NextThemesProvider>
  )
}
