'use client'

import { useState, useCallback, FormEvent } from 'react'
import { Rocket, Plus, X, Save, Loader2 } from 'lucide-react'
import { useHiperfocosStore, CORES_HIPERFOCOS } from '../../stores/hiperfocosStore'
import { useFormValidation } from '../../lib/hooks/useFormValidation'
import { validateHiperfoco, validateTarefa } from '../../lib/services/hiperfocosValidation'

interface FormData {
  titulo: string
  descricao: string
  corSelecionada: string
  tempoLimite: string
  tarefas: string[]
}

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  isValid?: boolean
  placeholder?: string
  type?: string
  maxLength?: number
  disabled?: boolean
  required?: boolean
}

function FormField({ 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  isValid, 
  placeholder, 
  type = 'text',
  maxLength,
  disabled = false,
  required = false
}: FieldProps) {
  const getBorderColor = () => {
    if (error) return 'border-red-500 focus:ring-red-500'
    if (isValid && value) return 'border-green-500 focus:ring-green-500'
    return 'border-gray-300 focus:ring-hiperfocos-primary'
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${getBorderColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={label}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${getBorderColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={label}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
          />
        )}
        
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${label}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function FormularioHiperfocoRefatorado() {
  const { adicionarHiperfoco, adicionarTarefa } = useHiperfocosStore()
  const validation = useFormValidation()
  
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    corSelecionada: CORES_HIPERFOCOS[0],
    tempoLimite: '',
    tarefas: ['']
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Validadores específicos para cada campo
  const validateTitulo = validation.createFieldValidator('titulo', (data) => {
    if (!data.texto || data.texto.trim() === '') {
      throw new Error('Título é obrigatório')
    }
    if (data.texto.length > 255) {
      throw new Error('Título deve ter no máximo 255 caracteres')
    }
  })

  const validateDescricao = validation.createDebouncedValidator('descricao', (data) => {
    if (data.texto && data.texto.length > 1000) {
      throw new Error('Descrição deve ter no máximo 1000 caracteres')
    }
  }, 500)

  const validateTempo = validation.createFieldValidator('tempoLimite', (data) => {
    if (data.texto && parseInt(data.texto) <= 0) {
      throw new Error('Tempo limite deve ser positivo')
    }
  })

  // Handlers para campos do formulário
  const handleTituloChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, titulo: value }))
  }, [])

  const handleDescricaoChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, descricao: value }))
    validateDescricao(value) // Validação com debounce
  }, [validateDescricao])

  const handleTempoChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, tempoLimite: value }))
  }, [])

  const handleTarefaChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const newTarefas = [...prev.tarefas]
      newTarefas[index] = value
      return { ...prev, tarefas: newTarefas }
    })
  }, [])

  const handleTarefaBlur = useCallback(async (index: number, value: string) => {
    await validation.validateField(`tarefa-${index}`, value, (data) => {
      if (!data.texto || data.texto.trim() === '') {
        throw new Error('Texto da tarefa é obrigatório')
      }
    })
  }, [validation])

  // Gerenciamento de tarefas
  const adicionarTarefaCampo = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      tarefas: [...prev.tarefas, '']
    }))
  }, [])

  const removerTarefaCampo = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      tarefas: prev.tarefas.filter((_, i) => i !== index)
    }))
    validation.clearError(`tarefa-${index}`)
  }, [validation])

  // Seleção de cor
  const selecionarCor = useCallback((cor: string) => {
    setFormData(prev => ({ ...prev, corSelecionada: cor }))
  }, [])

  // Submissão do formulário
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    validation.clearAllErrors()
    
    try {
      // Validar dados do hiperfoco
      const hiperfocoData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        cor: formData.corSelecionada,
        tempoLimite: formData.tempoLimite ? parseInt(formData.tempoLimite) : undefined
      }
      
      const isHiperfocoValid = await validation.validateForm(hiperfocoData, validateHiperfoco)
      
      // Validar tarefas
      const tarefasValidas = formData.tarefas.filter(t => t.trim() !== '')
      const isTarefasValid = await validation.validateArray('tarefas', 
        tarefasValidas.map(texto => ({ texto })), 
        validateTarefa
      )
      
      if (!isHiperfocoValid || !isTarefasValid) {
        return
      }
      
      // Criar hiperfoco (simular operação assíncrona)
      const hiperfocoId = await new Promise<string>((resolve) => {
        setTimeout(() => {
          const id = adicionarHiperfoco(
            formData.titulo,
            formData.descricao,
            formData.corSelecionada,
            hiperfocoData.tempoLimite
          )
          resolve(id)
        }, 100)
      })

      // Adicionar tarefas
      tarefasValidas.forEach(tarefa => {
        adicionarTarefa(hiperfocoId, tarefa)
      })
      
      // Feedback de sucesso
      setSubmitSuccess(true)
      
      // Limpar formulário
      setFormData({
        titulo: '',
        descricao: '',
        corSelecionada: CORES_HIPERFOCOS[0],
        tempoLimite: '',
        tarefas: ['']
      })
      
      // Remover feedback após 3 segundos
      setTimeout(() => setSubmitSuccess(false), 3000)
      
    } catch (error) {
      validation.setError('form', 'Erro ao criar hiperfoco')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isSubmitting, validation, adicionarHiperfoco, adicionarTarefa])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Rocket className="h-6 w-6 text-hiperfocos-primary mr-2" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Criar Novo Hiperfoco
        </h2>
      </div>

      {/* Feedback de sucesso */}
      {submitSuccess && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          ✅ Hiperfoco criado com sucesso!
        </div>
      )}

      {/* Erro geral do formulário */}
      {validation.getError('form') && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {validation.getError('form')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <FormField
          label="Título"
          value={formData.titulo}
          onChange={handleTituloChange}
          onBlur={() => validateTitulo(formData.titulo)}
          error={validation.getError('titulo')}
          isValid={!validation.getError('titulo') && formData.titulo.length > 0}
          placeholder="Ex: Estudar React"
          maxLength={255}
          disabled={isSubmitting}
          required
        />

        {/* Descrição */}
        <FormField
          label="Descrição"
          value={formData.descricao}
          onChange={handleDescricaoChange}
          error={validation.getError('descricao')}
          isValid={!validation.getError('descricao') && formData.descricao.length > 0}
          placeholder="Descreva seu hiperfoco..."
          type="textarea"
          maxLength={1000}
          disabled={isSubmitting}
        />

        {/* Tempo Limite */}
        <FormField
          label="Tempo Limite (minutos)"
          value={formData.tempoLimite}
          onChange={handleTempoChange}
          onBlur={() => validateTempo(formData.tempoLimite)}
          error={validation.getError('tempoLimite')}
          isValid={!validation.getError('tempoLimite') && formData.tempoLimite.length > 0}
          placeholder="Ex: 60"
          type="number"
          disabled={isSubmitting}
        />

        {/* Seletor de Cores */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cor do Hiperfoco
          </label>
          <div className="flex space-x-2">
            {CORES_HIPERFOCOS.map((cor) => (
              <button
                key={cor}
                type="button"
                onClick={() => selecionarCor(cor)}
                disabled={isSubmitting}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.corSelecionada === cor
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-gray-300 hover:scale-105'
                } disabled:opacity-50`}
                style={{ backgroundColor: cor }}
                aria-label={`Selecionar cor ${cor}`}
              />
            ))}
          </div>
        </div>

        {/* Tarefas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tarefas
            </label>
            <button
              type="button"
              onClick={adicionarTarefaCampo}
              disabled={isSubmitting}
              className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              aria-label="Adicionar tarefa"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Tarefa
            </button>
          </div>

          {formData.tarefas.map((tarefa, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="flex-1">
                <FormField
                  label={`Tarefa ${index + 1}`}
                  value={tarefa}
                  onChange={(value) => handleTarefaChange(index, value)}
                  onBlur={() => handleTarefaBlur(index, tarefa)}
                  error={validation.getError(`tarefa-${index}`) || validation.getError(`tarefas.${index}`)}
                  isValid={!validation.getError(`tarefa-${index}`) && tarefa.length > 0}
                  placeholder="Descreva a tarefa..."
                  maxLength={500}
                  disabled={isSubmitting}
                />
              </div>
              
              {formData.tarefas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removerTarefaCampo(index)}
                  disabled={isSubmitting}
                  className="mt-8 p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                  aria-label="Remover tarefa"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Botão de Submissão */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            {validation.hasErrors && (
              <span className="text-red-600">
                {validation.errorCount} erro{validation.errorCount !== 1 ? 's' : ''} encontrado{validation.errorCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || validation.hasErrors}
            className="inline-flex items-center px-6 py-3 bg-hiperfocos-primary text-white rounded-md hover:bg-hiperfocos-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Hiperfoco
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
