import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormValidation } from '@/app/lib/hooks/useFormValidation'
import { validateHiperfoco, validateTarefa, ValidationError } from '@/app/lib/services/hiperfocosValidation'

describe('useFormValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Inicialização', () => {
    it('deve inicializar com estado limpo', () => {
      const { result } = renderHook(() => useFormValidation())
      
      expect(result.current.errors).toEqual({})
      expect(result.current.isValid).toBe(true)
      expect(result.current.hasErrors).toBe(false)
      expect(result.current.isValidating).toBe(false)
    })

    it('deve aceitar erros iniciais', () => {
      const initialErrors = { titulo: 'Erro inicial' }
      const { result } = renderHook(() => useFormValidation(initialErrors))
      
      expect(result.current.errors).toEqual(initialErrors)
      expect(result.current.isValid).toBe(false)
      expect(result.current.hasErrors).toBe(true)
    })
  })

  describe('Validação de campos individuais', () => {
    it('deve validar campo com sucesso', async () => {
      const { result } = renderHook(() => useFormValidation())
      
      await act(async () => {
        const isValid = await result.current.validateField('titulo', 'Título válido', validateTarefa)
        expect(isValid).toBe(true)
      })
      
      expect(result.current.errors.titulo).toBeUndefined()
      expect(result.current.isValid).toBe(true)
    })

    it('deve capturar erro de validação', async () => {
      const { result } = renderHook(() => useFormValidation())
      
      await act(async () => {
        const isValid = await result.current.validateField('titulo', '', validateTarefa)
        expect(isValid).toBe(false)
      })
      
      expect(result.current.errors.titulo).toBe('Texto da tarefa é obrigatório')
      expect(result.current.isValid).toBe(false)
      expect(result.current.hasErrors).toBe(true)
    })

    it('deve limpar erro quando validação passa', async () => {
      const { result } = renderHook(() => useFormValidation({ titulo: 'Erro anterior' }))
      
      expect(result.current.hasErrors).toBe(true)
      
      await act(async () => {
        await result.current.validateField('titulo', 'Título válido', validateTarefa)
      })
      
      expect(result.current.errors.titulo).toBeUndefined()
      expect(result.current.hasErrors).toBe(false)
    })

    it('deve mostrar estado de validação durante processo', async () => {
      const { result } = renderHook(() => useFormValidation())
      
      const slowValidator = async (data: any) => {
        return new Promise(resolve => setTimeout(() => resolve(validateTarefa(data)), 100))
      }
      
      act(() => {
        result.current.validateField('titulo', 'Teste', slowValidator)
      })
      
      expect(result.current.isValidating).toBe(true)
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })
      
      expect(result.current.isValidating).toBe(false)
    })
  })

  describe('Validação de formulário completo', () => {
    it('deve validar hiperfoco completo com sucesso', async () => {
      const { result } = renderHook(() => useFormValidation())
      
      const formData = {
        titulo: 'Título válido',
        descricao: 'Descrição válida',
        cor: '#FF5252',
        tempoLimite: 60
      }
      
      await act(async () => {
        const isValid = await result.current.validateForm(formData, validateHiperfoco)
        expect(isValid).toBe(true)
      })
      
      expect(result.current.hasErrors).toBe(false)
    })

    it('deve capturar múltiplos erros de validação', async () => {
      const { result } = renderHook(() => useFormValidation())
      
      const formData = {
        titulo: '', // Erro: vazio
        descricao: 'a'.repeat(1001), // Erro: muito longo
        cor: 'cor-inválida', // Erro: formato inválido
        tempoLimite: -10 // Erro: negativo
      }
      
      await act(async () => {
        const isValid = await result.current.validateForm(formData, validateHiperfoco)
        expect(isValid).toBe(false)
      })
      
      expect(result.current.hasErrors).toBe(true)
      expect(result.current.errors.form).toContain('Título é obrigatório')
    })

    it('deve validar array de tarefas', async () => {
      const { result } = renderHook(() => useFormValidation())
      
      const tarefas = [
        { texto: 'Tarefa válida 1' },
        { texto: '' }, // Erro
        { texto: 'Tarefa válida 2' }
      ]
      
      await act(async () => {
        const isValid = await result.current.validateArray('tarefas', tarefas, validateTarefa)
        expect(isValid).toBe(false)
      })
      
      expect(result.current.errors['tarefas.1']).toBe('Texto da tarefa é obrigatório')
    })
  })

  describe('Gerenciamento de erros', () => {
    it('deve definir erro manualmente', () => {
      const { result } = renderHook(() => useFormValidation())
      
      act(() => {
        result.current.setError('campo', 'Erro manual')
      })
      
      expect(result.current.errors.campo).toBe('Erro manual')
      expect(result.current.hasErrors).toBe(true)
    })

    it('deve limpar erro específico', () => {
      const { result } = renderHook(() => useFormValidation({
        campo1: 'Erro 1',
        campo2: 'Erro 2'
      }))
      
      act(() => {
        result.current.clearError('campo1')
      })
      
      expect(result.current.errors.campo1).toBeUndefined()
      expect(result.current.errors.campo2).toBe('Erro 2')
      expect(result.current.hasErrors).toBe(true)
    })

    it('deve limpar todos os erros', () => {
      const { result } = renderHook(() => useFormValidation({
        campo1: 'Erro 1',
        campo2: 'Erro 2'
      }))
      
      act(() => {
        result.current.clearAllErrors()
      })
      
      expect(result.current.errors).toEqual({})
      expect(result.current.hasErrors).toBe(false)
    })

    it('deve obter erro específico', () => {
      const { result } = renderHook(() => useFormValidation({
        titulo: 'Erro do título'
      }))
      
      expect(result.current.getError('titulo')).toBe('Erro do título')
      expect(result.current.getError('inexistente')).toBeUndefined()
    })
  })

  describe('Validação condicional', () => {
    it('deve validar apenas se condição for verdadeira', async () => {
      const { result } = renderHook(() => useFormValidation())
      
      await act(async () => {
        const isValid = await result.current.validateFieldIf(
          'titulo',
          '',
          validateTarefa,
          false // Condição falsa
        )
        expect(isValid).toBe(true)
      })
      
      expect(result.current.errors.titulo).toBeUndefined()
    })

    it('deve validar quando condição for verdadeira', async () => {
      const { result } = renderHook(() => useFormValidation())
      
      await act(async () => {
        const isValid = await result.current.validateFieldIf(
          'titulo',
          '',
          validateTarefa,
          true // Condição verdadeira
        )
        expect(isValid).toBe(false)
      })
      
      expect(result.current.errors.titulo).toBe('Texto da tarefa é obrigatório')
    })
  })

  describe('Debounce de validação', () => {
    it('deve fazer debounce da validação', async () => {
      const { result } = renderHook(() => useFormValidation())
      const mockValidator = vi.fn().mockResolvedValue(undefined)
      
      act(() => {
        result.current.validateFieldDebounced('titulo', 'valor1', mockValidator, 100)
        result.current.validateFieldDebounced('titulo', 'valor2', mockValidator, 100)
        result.current.validateFieldDebounced('titulo', 'valor3', mockValidator, 100)
      })
      
      // Aguardar debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })
      
      // Deve ter chamado apenas uma vez com o último valor
      expect(mockValidator).toHaveBeenCalledTimes(1)
      expect(mockValidator).toHaveBeenCalledWith({ texto: 'valor3' })
    })
  })

  describe('Integração com formulários', () => {
    it('deve fornecer helper para onBlur', async () => {
      const { result } = renderHook(() => useFormValidation())
      
      const onBlurHandler = result.current.createFieldValidator('titulo', validateTarefa)
      
      await act(async () => {
        await onBlurHandler('Título válido')
      })
      
      expect(result.current.errors.titulo).toBeUndefined()
    })

    it('deve fornecer helper para onChange com debounce', async () => {
      const { result } = renderHook(() => useFormValidation())
      
      const onChangeHandler = result.current.createDebouncedValidator('titulo', validateTarefa, 50)
      
      act(() => {
        onChangeHandler('Título')
      })
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      expect(result.current.errors.titulo).toBeUndefined()
    })
  })

  describe('Estados computados', () => {
    it('deve calcular isValid corretamente', () => {
      const { result } = renderHook(() => useFormValidation())
      
      expect(result.current.isValid).toBe(true)
      
      act(() => {
        result.current.setError('campo', 'Erro')
      })
      
      expect(result.current.isValid).toBe(false)
    })

    it('deve calcular hasErrors corretamente', () => {
      const { result } = renderHook(() => useFormValidation())
      
      expect(result.current.hasErrors).toBe(false)
      
      act(() => {
        result.current.setError('campo', 'Erro')
      })
      
      expect(result.current.hasErrors).toBe(true)
    })

    it('deve contar total de erros', () => {
      const { result } = renderHook(() => useFormValidation({
        campo1: 'Erro 1',
        campo2: 'Erro 2',
        campo3: 'Erro 3'
      }))
      
      expect(result.current.errorCount).toBe(3)
    })
  })
})
