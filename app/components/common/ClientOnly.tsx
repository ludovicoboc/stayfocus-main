'use client'

import { useIsClient } from '@/app/hooks/useIsClient'
import { ReactNode } from 'react'

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente que renderiza seus filhos apenas no cliente
 * Útil para componentes que dependem de APIs do browser
 * 
 * @param children - Componentes a serem renderizados apenas no cliente
 * @param fallback - Componente a ser renderizado no servidor (opcional)
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useIsClient()
  
  if (!isClient) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * HOC para tornar um componente "client-only"
 * 
 * @param Component - Componente a ser envolvido
 * @param fallback - Componente de fallback para o servidor
 */
export function withClientOnly<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return function ClientOnlyComponent(props: T) {
    return (
      <ClientOnly fallback={fallback}>
        <Component {...props} />
      </ClientOnly>
    )
  }
}
