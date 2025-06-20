import { useState, useCallback, useMemo, useRef } from 'react'
import { ValidationError } from '../services/hiperfocosValidation'

export interface ValidationErrors {
  [key: string]: string
}

export type ValidatorFunction<T = any> = (data: T) => void | Promise<void>

export interface UseFormValidationReturn {
  // Estado
  errors: ValidationErrors
  isValid: boolean
  hasErrors: boolean
  isValidating: boolean
  errorCount: number
  
  // Validação de campos
  validateField: <T>(field: string, value: T, validator: ValidatorFunction<{ texto?: string; [key: string]: any }>) => Promise<boolean>
  validateFieldIf: <T>(field: string, value: T, validator: ValidatorFunction<{ texto?: string; [key: string]: any }>, condition: boolean) => Promise<boolean>
  validateFieldDebounced: <T>(field: string, value: T, validator: ValidatorFunction<{ texto?: string; [key: string]: any }>, delay?: number) => void
  
  // Validação de formulários
  validateForm: <T>(data: T, validator: ValidatorFunction<T>) => Promise<boolean>
  validateArray: <T>(field: string, items: T[], validator: ValidatorFunction<T>) => Promise<boolean>
  
  // Gerenciamento de erros
  setError: (field: string, message: string) => void
  clearError: (field: string) => void
  clearAllErrors: () => void
  getError: (field: string) => string | undefined
  
  // Helpers para formulários
  createFieldValidator: <T>(field: string, validator: ValidatorFunction<{ texto?: string; [key: string]: any }>) => (value: T) => Promise<boolean>
  createDebouncedValidator: <T>(field: string, validator: ValidatorFunction<{ texto?: string; [key: string]: any }>, delay?: number) => (value: T) => void
}

export function useFormValidation(initialErrors: ValidationErrors = {}): UseFormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>(initialErrors)
  const [isValidating, setIsValidating] = useState(false)
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({})
  
  // Estados computados
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors])
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])
  const errorCount = useMemo(() => Object.keys(errors).length, [errors])
  
  // Validação de campo individual
  const validateField = useCallback(async <T>(
    field: string,
    value: T,
    validator: ValidatorFunction<{ texto?: string; [key: string]: any }>
  ): Promise<boolean> => {
    setIsValidating(true)
    
    try {
      // Preparar dados para validação
      let validationData: any
      
      if (typeof value === 'string') {
        validationData = { texto: value }
      } else if (typeof value === 'object' && value !== null) {
        validationData = value
      } else {
        validationData = { value }
      }
      
      await validator(validationData)
      
      // Se chegou aqui, validação passou
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
      
      return true
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.message
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          [field]: 'Erro de validação'
        }))
      }
      
      return false
    } finally {
      setIsValidating(false)
    }
  }, [])
  
  // Validação condicional
  const validateFieldIf = useCallback(async <T>(
    field: string,
    value: T,
    validator: ValidatorFunction<{ texto?: string; [key: string]: any }>,
    condition: boolean
  ): Promise<boolean> => {
    if (!condition) {
      // Se condição é falsa, limpar erro se existir
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
      return true
    }
    
    return validateField(field, value, validator)
  }, [validateField])
  
  // Validação com debounce
  const validateFieldDebounced = useCallback(<T>(
    field: string,
    value: T,
    validator: ValidatorFunction<{ texto?: string; [key: string]: any }>,
    delay: number = 300
  ): void => {
    // Limpar timer anterior se existir
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field])
    }
    
    // Criar novo timer
    debounceTimers.current[field] = setTimeout(() => {
      validateField(field, value, validator)
      delete debounceTimers.current[field]
    }, delay)
  }, [validateField])
  
  // Validação de formulário completo
  const validateForm = useCallback(async <T>(
    data: T,
    validator: ValidatorFunction<T>
  ): Promise<boolean> => {
    setIsValidating(true)
    
    try {
      await validator(data)
      
      // Se chegou aqui, validação passou
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.form
        return newErrors
      })
      
      return true
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(prev => ({
          ...prev,
          form: error.message
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          form: 'Erro de validação do formulário'
        }))
      }
      
      return false
    } finally {
      setIsValidating(false)
    }
  }, [])
  
  // Validação de array
  const validateArray = useCallback(async <T>(
    field: string,
    items: T[],
    validator: ValidatorFunction<T>
  ): Promise<boolean> => {
    setIsValidating(true)
    let hasAnyError = false
    
    try {
      // Limpar erros anteriores do array
      setErrors(prev => {
        const newErrors = { ...prev }
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith(`${field}.`)) {
            delete newErrors[key]
          }
        })
        return newErrors
      })
      
      // Validar cada item
      for (let i = 0; i < items.length; i++) {
        try {
          await validator(items[i])
        } catch (error) {
          hasAnyError = true
          if (error instanceof ValidationError) {
            setErrors(prev => ({
              ...prev,
              [`${field}.${i}`]: error.message
            }))
          }
        }
      }
      
      return !hasAnyError
    } finally {
      setIsValidating(false)
    }
  }, [])
  
  // Gerenciamento manual de erros
  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }))
  }, [])
  
  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])
  
  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])
  
  const getError = useCallback((field: string): string | undefined => {
    return errors[field]
  }, [errors])
  
  // Helpers para integração com formulários
  const createFieldValidator = useCallback(<T>(
    field: string,
    validator: ValidatorFunction<{ texto?: string; [key: string]: any }>
  ) => {
    return (value: T) => validateField(field, value, validator)
  }, [validateField])
  
  const createDebouncedValidator = useCallback(<T>(
    field: string,
    validator: ValidatorFunction<{ texto?: string; [key: string]: any }>,
    delay: number = 300
  ) => {
    return (value: T) => validateFieldDebounced(field, value, validator, delay)
  }, [validateFieldDebounced])
  
  return {
    // Estado
    errors,
    isValid,
    hasErrors,
    isValidating,
    errorCount,
    
    // Validação de campos
    validateField,
    validateFieldIf,
    validateFieldDebounced,
    
    // Validação de formulários
    validateForm,
    validateArray,
    
    // Gerenciamento de erros
    setError,
    clearError,
    clearAllErrors,
    getError,
    
    // Helpers
    createFieldValidator,
    createDebouncedValidator
  }
}
