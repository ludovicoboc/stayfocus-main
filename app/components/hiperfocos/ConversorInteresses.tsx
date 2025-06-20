'use client'

import { useState, useRef, FormEvent } from 'react'
import { Rocket, CheckCircle, PlusCircle, X, Save, Loader2 } from 'lucide-react'
import { useCreateHiperfoco, useUserId } from '../../hooks/useHiperfocos'
import { useCreateTarefa } from '../../hooks/useTarefas'
import { validateHiperfoco, validateTarefa, ValidationError } from '../../lib/services/hiperfocosValidation'

// Cores disponíveis para hiperfocos
const CORES_HIPERFOCOS = [
  '#FF5252', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
]

export function ConversorInteresses() {
  const userId = useUserId()
  const createHiperfocoMutation = useCreateHiperfoco()
  const createTarefaMutation = useCreateTarefa()

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    corSelecionada: CORES_HIPERFOCOS[0],
    tempoLimite: '',
    novasTarefas: [''] // Iniciar com um campo vazio
  })

  const [feedback, setFeedback] = useState<{
    tipo: 'sucesso' | 'erro',
    mensagem: string
  } | null>(null)

  const formRef = useRef<HTMLFormElement>(null)

  // Estado de loading combinado
  const isLoading = createHiperfocoMutation.isPending || createTarefaMutation.isPending
  
  // Função para adicionar mais campos de tarefas
  const adicionarCampoTarefa = () => {
    setFormData({
      ...formData,
      novasTarefas: [...formData.novasTarefas, '']
    })
  }
  
  // Função para atualizar uma tarefa específica
  const atualizarTarefa = (index: number, valor: string) => {
    const tarefasAtualizadas = [...formData.novasTarefas]
    tarefasAtualizadas[index] = valor
    
    setFormData({
      ...formData,
      novasTarefas: tarefasAtualizadas
    })
  }
  
  // Função para remover uma tarefa
  const removerTarefa = (index: number) => {
    const tarefasAtualizadas = formData.novasTarefas.filter((_, i) => i !== index)
    
    setFormData({
      ...formData,
      novasTarefas: tarefasAtualizadas
    })
  }
  
  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      // Validar dados do hiperfoco usando o service
      const tempoLimiteInt = formData.tempoLimite ? parseInt(formData.tempoLimite) : undefined

      validateHiperfoco({
        titulo: formData.titulo,
        descricao: formData.descricao,
        cor: formData.corSelecionada,
        tempoLimite: tempoLimiteInt
      })

      // Validar tarefas não vazias
      const tarefasValidas = formData.novasTarefas.filter(t => t.trim() !== '')

      if (tarefasValidas.length === 0) {
        throw new ValidationError('Adicione pelo menos uma tarefa')
      }

      // Validar cada tarefa individualmente
      tarefasValidas.forEach(tarefa => {
        validateTarefa({ texto: tarefa })
      })

      // Criar o hiperfoco via API
      const hiperfocoResult = await createHiperfocoMutation.mutateAsync({
        user_id: userId,
        titulo: formData.titulo,
        descricao: formData.descricao || undefined,
        cor: formData.corSelecionada,
        tempo_limite: tempoLimiteInt
      })

      // Criar as tarefas via API
      const hiperfocoId = hiperfocoResult.data.id
      for (let i = 0; i < tarefasValidas.length; i++) {
        await createTarefaMutation.mutateAsync({
          hiperfoco_id: hiperfocoId,
          user_id: userId,
          texto: tarefasValidas[i],
          ordem: i
        })
      }

      // Feedback de sucesso
      setFeedback({
        tipo: 'sucesso',
        mensagem: 'Hiperfoco criado com sucesso!'
      })

      // Limpar o formulário
      setFormData({
        titulo: '',
        descricao: '',
        corSelecionada: CORES_HIPERFOCOS[0],
        tempoLimite: '',
        novasTarefas: ['']
      })

      // Timer para remover o feedback
      setTimeout(() => {
        setFeedback(null)
      }, 3000)
    } catch (error) {
      console.error('Erro ao criar hiperfoco:', error)

      if (error instanceof ValidationError) {
        setFeedback({
          tipo: 'erro',
          mensagem: error.message
        })
      } else {
        setFeedback({
          tipo: 'erro',
          mensagem: 'Ocorreu um erro ao criar o hiperfoco. Tente novamente.'
        })
      }
    }
  }
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <Rocket className="h-6 w-6 text-hiperfocos-primary mr-2" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Conversor de Interesses
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Transforme um interesse intenso em um projeto estruturado com tarefas claras e objetivas.
      </p>
      
      {feedback && (
        <div 
          className={`mb-4 p-3 rounded-md ${
            feedback.tipo === 'sucesso' 
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}
          role="alert"
        >
          {feedback.tipo === 'sucesso' ? (
            <CheckCircle className="h-5 w-5 inline mr-2" aria-hidden="true" />
          ) : (
            <X className="h-5 w-5 inline mr-2" aria-hidden="true" />
          )}
          {feedback.mensagem}
        </div>
      )}
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Informações básicas do hiperfoco */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label 
              htmlFor="titulo" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Título do Interesse/Hiperfoco *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary focus:border-hiperfocos-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              aria-required="true"
            />
          </div>
          
          <div>
            <label 
              htmlFor="tempoLimite" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Tempo Limite (em minutos, opcional)
            </label>
            <input
              type="number"
              id="tempoLimite"
              name="tempoLimite"
              value={formData.tempoLimite}
              onChange={(e) => setFormData({ ...formData, tempoLimite: e.target.value })}
              min="1"
              placeholder="Ex: 60"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary focus:border-hiperfocos-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        
        <div>
          <label 
            htmlFor="descricao" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Descrição
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary focus:border-hiperfocos-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Descreva seu interesse ou hiperfoco"
          />
        </div>
        
        {/* Seleção de cor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cor do Hiperfoco
          </label>
          <div className="flex gap-2 flex-wrap">
            {CORES_HIPERFOCOS.map((cor) => (
              <button
                key={cor}
                type="button"
                onClick={() => setFormData({ ...formData, corSelecionada: cor })}
                className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hiperfocos-primary ${
                  formData.corSelecionada === cor ? 'ring-2 ring-offset-2 ring-hiperfocos-primary' : ''
                }`}
                style={{ backgroundColor: cor }}
                aria-label={`Cor ${cor}`}
                aria-pressed={formData.corSelecionada === cor}
              />
            ))}
          </div>
        </div>
        
        {/* Lista de tarefas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Decomposição em Tarefas *
          </label>
          
          <div className="space-y-3">
            {formData.novasTarefas.map((tarefa, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={tarefa}
                  onChange={(e) => atualizarTarefa(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary focus:border-hiperfocos-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={`Tarefa ${index + 1}`}
                  aria-label={`Tarefa ${index + 1}`}
                />
                
                <button
                  type="button"
                  onClick={() => removerTarefa(index)}
                  className="p-2 text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  aria-label="Remover tarefa"
                  disabled={formData.novasTarefas.length <= 1}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={adicionarCampoTarefa}
            className="mt-3 flex items-center text-hiperfocos-primary hover:text-hiperfocos-secondary"
            aria-label="Adicionar mais uma tarefa"
          >
            <PlusCircle className="h-5 w-5 mr-1" aria-hidden="true" />
            Adicionar mais uma tarefa
          </button>
        </div>
        
        {/* Botão de envio */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-hiperfocos-primary hover:bg-hiperfocos-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hiperfocos-primary disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Converter interesse em hiperfoco"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" aria-hidden="true" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" aria-hidden="true" />
                Converter em Hiperfoco
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
