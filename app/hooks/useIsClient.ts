import { useEffect, useState } from 'react'

/**
 * Hook para verificar se o código está executando no cliente
 * Resolve problemas de hidratação ao garantir que APIs do browser
 * só sejam acessadas após a hidratação estar completa
 * 
 * @returns boolean - true se estiver no cliente, false no servidor
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook para verificar se uma API específica do browser está disponível
 * 
 * @param apiName - Nome da API a verificar (ex: 'localStorage', 'navigator')
 * @returns boolean - true se a API estiver disponível
 */
export function useBrowserAPI(apiName: string): boolean {
  const isClient = useIsClient()
  
  return isClient && typeof window !== 'undefined' && apiName in window
}

/**
 * Hook para acessar localStorage de forma segura
 * 
 * @returns objeto com métodos seguros para localStorage ou null se não disponível
 */
export function useSafeLocalStorage() {
  const isClient = useIsClient()
  
  if (!isClient || typeof window === 'undefined' || !window.localStorage) {
    return null
  }
  
  return {
    getItem: (key: string) => {
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value)
        return true
      } catch {
        return false
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key)
        return true
      } catch {
        return false
      }
    }
  }
}
