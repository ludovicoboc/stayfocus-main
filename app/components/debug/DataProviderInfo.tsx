'use client'

import { useEffect } from 'react'
import { logProviderInfo } from '@/app/lib/dataProviders'
import { useIsClient } from '@/app/hooks/useIsClient'

/**
 * Componente para mostrar informações do DataProvider no console
 * Apenas em desenvolvimento e apenas no cliente
 */
export function DataProviderInfo() {
  const isClient = useIsClient()
  
  useEffect(() => {
    if (isClient && process.env.NODE_ENV === 'development') {
      // Aguardar um pouco para não interferir com o carregamento inicial
      const timer = setTimeout(() => {
        logProviderInfo()
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isClient])
  
  // Este componente não renderiza nada visualmente
  return null
}
