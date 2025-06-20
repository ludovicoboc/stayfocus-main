import { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { TarefaNode } from '../services/tarefasHierarchy'

/**
 * Hook para otimizações de performance em listas grandes de tarefas
 */
export function usePerformanceOptimization() {
  const renderCountRef = useRef(0)
  const lastRenderTimeRef = useRef(Date.now())
  const memoizedCalculationsRef = useRef(new Map())

  // Incrementar contador de renders
  useEffect(() => {
    renderCountRef.current += 1
    lastRenderTimeRef.current = Date.now()
  })

  // Memoização inteligente para cálculos pesados
  const memoizedCalculation = useCallback(<T, R>(
    key: string,
    calculation: () => R,
    dependencies: T[]
  ): R => {
    const depsKey = JSON.stringify(dependencies)
    const fullKey = `${key}-${depsKey}`
    
    if (memoizedCalculationsRef.current.has(fullKey)) {
      return memoizedCalculationsRef.current.get(fullKey)
    }
    
    const result = calculation()
    memoizedCalculationsRef.current.set(fullKey, result)
    
    // Limpar cache antigo (manter apenas últimas 50 entradas)
    if (memoizedCalculationsRef.current.size > 50) {
      const entries = Array.from(memoizedCalculationsRef.current.entries())
      memoizedCalculationsRef.current.clear()
      entries.slice(-25).forEach(([k, v]) => {
        memoizedCalculationsRef.current.set(k, v)
      })
    }
    
    return result
  }, [])

  // Otimização para hierarquia de tarefas
  const optimizeTaskHierarchy = useCallback((tasks: TarefaNode[]) => {
    return memoizedCalculation(
      'task-hierarchy',
      () => {
        // Calcular estatísticas de forma otimizada
        let totalCount = 0
        let completedCount = 0
        
        const traverse = (nodes: TarefaNode[]) => {
          for (const node of nodes) {
            totalCount++
            if (node.concluida) completedCount++
            if (node.children.length > 0) {
              traverse(node.children)
            }
          }
        }
        
        traverse(tasks)
        
        return {
          totalCount,
          completedCount,
          progressPercentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
          hasIncompleteTasks: completedCount < totalCount
        }
      },
      [tasks]
    )
  }, [memoizedCalculation])

  // Debounce otimizado para validação
  const optimizedDebounce = useCallback(<T extends any[]>(
    func: (...args: T) => void,
    delay: number
  ) => {
    const timeoutRef = useRef<NodeJS.Timeout>()
    
    return useCallback((...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        func(...args)
      }, delay)
    }, [func, delay])
  }, [])

  // Virtualização para listas grandes
  const useVirtualization = useCallback((
    items: any[],
    itemHeight: number,
    containerHeight: number
  ) => {
    return memoizedCalculation(
      'virtualization',
      () => {
        const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 // Buffer
        const totalHeight = items.length * itemHeight
        
        return {
          visibleCount,
          totalHeight,
          getVisibleItems: (scrollTop: number) => {
            const startIndex = Math.floor(scrollTop / itemHeight)
            const endIndex = Math.min(startIndex + visibleCount, items.length)
            
            return {
              startIndex,
              endIndex,
              items: items.slice(startIndex, endIndex),
              offsetY: startIndex * itemHeight
            }
          }
        }
      },
      [items.length, itemHeight, containerHeight]
    )
  }, [memoizedCalculation])

  // Otimização de re-renders
  const createStableCallback = useCallback(<T extends any[], R>(
    callback: (...args: T) => R,
    dependencies: any[]
  ) => {
    return useCallback(callback, dependencies)
  }, [])

  // Métricas de performance
  const getPerformanceMetrics = useCallback(() => {
    return {
      renderCount: renderCountRef.current,
      lastRenderTime: lastRenderTimeRef.current,
      cacheSize: memoizedCalculationsRef.current.size,
      averageRenderTime: Date.now() - lastRenderTimeRef.current
    }
  }, [])

  // Limpar cache manualmente
  const clearCache = useCallback(() => {
    memoizedCalculationsRef.current.clear()
  }, [])

  return {
    memoizedCalculation,
    optimizeTaskHierarchy,
    optimizedDebounce,
    useVirtualization,
    createStableCallback,
    getPerformanceMetrics,
    clearCache
  }
}

/**
 * Hook para otimização de formulários grandes
 */
export function useFormPerformanceOptimization() {
  const fieldValidationCache = useRef(new Map())
  const lastValidationTime = useRef(new Map())

  const optimizedFieldValidation = useCallback((
    fieldName: string,
    value: any,
    validator: (value: any) => boolean | string,
    debounceMs: number = 300
  ) => {
    const now = Date.now()
    const lastTime = lastValidationTime.current.get(fieldName) || 0
    
    // Se muito pouco tempo passou, usar cache
    if (now - lastTime < debounceMs) {
      const cached = fieldValidationCache.current.get(`${fieldName}-${value}`)
      if (cached !== undefined) {
        return cached
      }
    }
    
    // Executar validação
    const result = validator(value)
    
    // Atualizar cache e timestamp
    fieldValidationCache.current.set(`${fieldName}-${value}`, result)
    lastValidationTime.current.set(fieldName, now)
    
    return result
  }, [])

  const clearValidationCache = useCallback(() => {
    fieldValidationCache.current.clear()
    lastValidationTime.current.clear()
  }, [])

  return {
    optimizedFieldValidation,
    clearValidationCache
  }
}

/**
 * Hook para lazy loading de componentes
 */
export function useLazyLoading<T>(
  loadFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const loadedRef = useRef(false)

  const load = useCallback(async () => {
    if (loadedRef.current) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await loadFunction()
      setData(result)
      loadedRef.current = true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro no carregamento'))
    } finally {
      setLoading(false)
    }
  }, dependencies)

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    loadedRef.current = false
  }, [])

  return {
    data,
    loading,
    error,
    load,
    reset,
    isLoaded: loadedRef.current
  }
}

/**
 * Hook para otimização de animações
 */
export function useAnimationOptimization() {
  const animationFrameRef = useRef<number>()
  const isAnimatingRef = useRef(false)

  const requestOptimizedAnimation = useCallback((callback: () => void) => {
    if (isAnimatingRef.current) return

    isAnimatingRef.current = true
    animationFrameRef.current = requestAnimationFrame(() => {
      callback()
      isAnimatingRef.current = false
    })
  }, [])

  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      isAnimatingRef.current = false
    }
  }, [])

  useEffect(() => {
    return () => {
      cancelAnimation()
    }
  }, [cancelAnimation])

  return {
    requestOptimizedAnimation,
    cancelAnimation,
    isAnimating: isAnimatingRef.current
  }
}
