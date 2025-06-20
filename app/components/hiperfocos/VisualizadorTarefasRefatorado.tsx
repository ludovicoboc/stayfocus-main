'use client'

import { useState, useCallback } from 'react'
import { CheckCircle, Circle, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { useHiperfocosHierarchy } from '../../lib/hooks/useHiperfocosHierarchy'
import { TarefaNode } from '../../lib/services/tarefasHierarchy'
import { ValidationError } from '../../lib/services/hiperfocosValidation'

interface VisualizadorTarefasRefatoradoProps {
  initialTasks?: TarefaNode[]
}

interface TaskItemProps {
  task: TarefaNode
  level: number
  onToggle: (id: string) => void
  onEdit: (id: string, newText: string) => void
  onDelete: (id: string) => void
  onAddSubtask: (parentId: string, text: string) => void
}

export function VisualizadorTarefasRefatorado({ initialTasks }: VisualizadorTarefasRefatoradoProps) {
  const hierarchy = useHiperfocosHierarchy(initialTasks)
  const [newTaskText, setNewTaskText] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddTask = useCallback(async () => {
    if (!newTaskText.trim()) {
      setError('Texto da tarefa é obrigatório')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      await hierarchy.addTask(newTaskText.trim(), null)
      
      setNewTaskText('')
      setIsAddingTask(false)
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message)
      } else {
        setError('Erro ao adicionar tarefa')
      }
    } finally {
      setIsLoading(false)
    }
  }, [newTaskText, hierarchy])

  const handleToggleTask = useCallback((id: string) => {
    try {
      hierarchy.toggleTaskCompletion(id)
    } catch (err) {
      setError('Erro ao atualizar tarefa')
    }
  }, [hierarchy])

  const handleEditTask = useCallback((id: string, newText: string) => {
    if (!newText.trim()) {
      setError('Texto da tarefa é obrigatório')
      return
    }

    try {
      hierarchy.updateTask(id, { texto: newText.trim() })
      setError(null)
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message)
      } else {
        setError('Erro ao editar tarefa')
      }
    }
  }, [hierarchy])

  const handleDeleteTask = useCallback((id: string) => {
    try {
      hierarchy.removeTask(id)
      setError(null)
    } catch (err) {
      setError('Erro ao remover tarefa')
    }
  }, [hierarchy])

  const handleAddSubtask = useCallback((parentId: string, text: string) => {
    if (!text.trim()) {
      setError('Texto da tarefa é obrigatório')
      return
    }

    try {
      hierarchy.addTask(text.trim(), parentId)
      setError(null)
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message)
      } else {
        setError('Erro ao adicionar subtarefa')
      }
    }
  }, [hierarchy])

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {hierarchy.totalCount} tarefas
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {hierarchy.completedCount} concluída{hierarchy.completedCount !== 1 ? 's' : ''}
            </span>
            <span className="text-sm font-medium text-hiperfocos-primary">
              {hierarchy.progressPercentage}% completo
            </span>
          </div>
          
          <button
            onClick={() => setIsAddingTask(true)}
            className="inline-flex items-center px-3 py-1 text-sm bg-hiperfocos-primary text-white rounded-md hover:bg-hiperfocos-secondary"
            aria-label="Adicionar tarefa"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Tarefa
          </button>
        </div>

        {/* Barra de progresso */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-hiperfocos-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${hierarchy.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Formulário de nova tarefa */}
      {isAddingTask && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Nova tarefa..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary"
              autoFocus
              disabled={isLoading}
            />
            <button
              onClick={handleAddTask}
              disabled={isLoading}
              className="px-4 py-2 bg-hiperfocos-primary text-white rounded-md hover:bg-hiperfocos-secondary disabled:opacity-50"
              aria-label="Confirmar"
            >
              {isLoading ? 'Salvando...' : 'Confirmar'}
            </button>
            <button
              onClick={() => {
                setIsAddingTask(false)
                setNewTaskText('')
                setError(null)
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de tarefas */}
      {hierarchy.rootTasks.length > 0 ? (
        <ul role="list" className="space-y-2">
          {hierarchy.rootTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              level={0}
              onToggle={handleToggleTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAddSubtask={handleAddSubtask}
            />
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Nenhuma tarefa criada ainda.</p>
          <p className="text-sm">Clique em "Adicionar Tarefa" para começar.</p>
        </div>
      )}
    </div>
  )
}

function TaskItem({ task, level, onToggle, onEdit, onDelete, onAddSubtask }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.texto)
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const [subtaskText, setSubtaskText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSaveEdit = () => {
    onEdit(task.id, editText)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditText(task.texto)
    setIsEditing(false)
  }

  const handleAddSubtask = () => {
    onAddSubtask(task.id, subtaskText)
    setSubtaskText('')
    setIsAddingSubtask(false)
  }

  const handleDeleteConfirm = () => {
    onDelete(task.id)
    setShowDeleteConfirm(false)
  }

  const indentClass = level > 0 ? `ml-${level * 6}` : ''

  return (
    <li role="listitem" data-level={level} className={`${indentClass}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="flex items-center space-x-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(task.id)}
            className="flex-shrink-0"
            aria-label={`Marcar "${task.texto}" como ${task.concluida ? 'não concluída' : 'concluída'}`}
            role="checkbox"
            aria-checked={task.concluida}
          >
            {task.concluida ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {/* Texto da tarefa */}
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="p-1 text-green-600 hover:text-green-800"
                  aria-label="Salvar"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-gray-600 hover:text-gray-800"
                  aria-label="Cancelar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <span
                className={`${
                  task.concluida
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {task.texto}
              </span>
            )}
          </div>

          {/* Ações */}
          {!isEditing && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-600 hover:text-gray-800"
                aria-label="Editar"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsAddingSubtask(true)}
                className="p-1 text-hiperfocos-primary hover:text-hiperfocos-secondary"
                aria-label="Adicionar subtarefa"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 text-red-600 hover:text-red-800"
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Formulário de subtarefa */}
        {isAddingSubtask && (
          <div className="mt-3 flex items-center space-x-2">
            <input
              type="text"
              value={subtaskText}
              onChange={(e) => setSubtaskText(e.target.value)}
              placeholder="Nova subtarefa..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary"
              autoFocus
            />
            <button
              onClick={handleAddSubtask}
              className="px-3 py-2 bg-hiperfocos-primary text-white rounded-md hover:bg-hiperfocos-secondary"
              aria-label="Confirmar"
            >
              Confirmar
            </button>
            <button
              onClick={() => {
                setIsAddingSubtask(false)
                setSubtaskText('')
              }}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Confirmação de exclusão */}
        {showDeleteConfirm && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 mb-2">
              Tem certeza que deseja remover esta tarefa e todas as suas subtarefas?
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                aria-label="Confirmar remoção"
              >
                Confirmar Remoção
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Renderizar subtarefas recursivamente */}
      {task.children.length > 0 && (
        <ul className="mt-2 space-y-2">
          {task.children.map((child) => (
            <TaskItem
              key={child.id}
              task={child}
              level={level + 1}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
