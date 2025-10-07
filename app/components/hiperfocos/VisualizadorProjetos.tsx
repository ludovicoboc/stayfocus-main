'use client'

import { useState } from 'react'
import { useHiperfocosStore, type Hiperfoco, type Tarefa } from '../../stores/hiperfocosStore'
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Check } from 'lucide-react'

export function VisualizadorProjetos() {
  const {
    hiperfocos,
    adicionarTarefa,
    adicionarSubTarefa,
    toggleTarefaConcluida,
    toggleSubTarefaConcluida,
    atualizarTarefa,
    atualizarSubTarefa,
    removerTarefa,
    removerSubTarefa
  } = useHiperfocosStore()

  const [hiperfocoAtivo, setHiperfocoAtivo] = useState<string | null>(
    hiperfocos.length > 0 ? hiperfocos[0].id : null
  )

  const [expandidas, setExpandidas] = useState<Record<string, boolean>>({})
  const [novoItemTexto, setNovoItemTexto] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [textoEdicao, setTextoEdicao] = useState<string>('')

  const toggleExpand = (tarefaId: string) => {
    setExpandidas(prev => ({ ...prev, [tarefaId]: !prev[tarefaId] }))
  }

  const handleSalvarEdicao = (tarefaId: string, tipo: 'tarefa' | 'subtarefa') => {
    if (!textoEdicao.trim()) return;
    
    const updates = { texto: textoEdicao };

    if (tipo === 'tarefa') {
      atualizarTarefa(tarefaId, updates);
    } else {
      atualizarSubTarefa(tarefaId, updates);
    }
    setEditandoId(null);
    setTextoEdicao('');
  }

  const handleAdicionarItem = (hiperfocoId: string, tipo: 'tarefa' | 'subtarefa', tarefaPaiId?: string) => {
    if (!novoItemTexto.trim()) return;
    
    if (tipo === 'tarefa') {
      adicionarTarefa(hiperfocoId, novoItemTexto);
    } else if (tipo === 'subtarefa' && tarefaPaiId) {
      adicionarSubTarefa(hiperfocoId, tarefaPaiId, novoItemTexto);
    }
    setNovoItemTexto('');
  }

  const renderItem = (item: Tarefa, hiperfoco: Hiperfoco, tipo: 'tarefa' | 'subtarefa', tarefaPaiId?: string) => {
    const isEditing = editandoId === item.id;
    return (
      <div key={item.id} className="flex items-center mb-2">
        <button
          onClick={() => (tipo === 'tarefa' ? toggleTarefaConcluida(hiperfoco.id, item.id) : toggleSubTarefaConcluida(hiperfoco.id, tarefaPaiId!, item.id))}
          className={`p-1 rounded-md mr-2 ${
            item.concluida
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Check className="h-3 w-3" />
        </button>

        {isEditing ? (
          <input
            type="text"
            value={textoEdicao}
            onChange={(e) => setTextoEdicao(e.target.value)}
            onBlur={() => handleSalvarEdicao(item.id, tipo)}
            onKeyDown={(e) => e.key === 'Enter' && handleSalvarEdicao(item.id, tipo)}
            className="flex-1 px-2 py-1 text-sm border rounded-md"
            autoFocus
          />
        ) : (
          <span className={`flex-1 text-xs ${item.concluida ? 'line-through text-gray-500' : 'text-gray-600'}`}>
            {item.texto}
          </span>
        )}

        <div className="flex space-x-1 ml-2">
          <button onClick={() => { setEditandoId(item.id); setTextoEdicao(item.texto); }} className="p-0.5 text-gray-500 hover:text-gray-700">
            <Edit className="h-3 w-3" />
          </button>
          <button onClick={() => (tipo === 'tarefa' ? removerTarefa(hiperfoco.id, item.id) : removerSubTarefa(hiperfoco.id, tarefaPaiId!, item.id))} className="p-0.5 text-gray-500 hover:text-red-500">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  };
  
  const renderizarTarefa = (hiperfoco: Hiperfoco, tarefa: Tarefa) => {
    const isExpanded = expandidas[tarefa.id] || false
    const temSubtarefas = hiperfoco.subTarefas && hiperfoco.subTarefas[tarefa.id]?.length > 0
    
    return (
      <div 
        key={tarefa.id}
        className="border-l-2 pl-3 my-2"
        style={{ borderColor: hiperfoco.cor }}
      >
        <div className="flex items-center">
          <button
            onClick={() => toggleExpand(tarefa.id)}
            className={`p-1 text-gray-500 ${!temSubtarefas && 'invisible'}`}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {renderItem(tarefa, hiperfoco, 'tarefa')}
        </div>
        
        {isExpanded && (
          <div className="ml-10 mt-2">
            {(hiperfoco.subTarefas[tarefa.id] || []).map((subTarefa) => renderItem(subTarefa, hiperfoco, 'subtarefa', tarefa.id))}
            <div className="flex items-center mt-2">
              <input
                type="text"
                value={novoItemTexto}
                onChange={(e) => setNovoItemTexto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdicionarItem(hiperfoco.id, 'subtarefa', tarefa.id)}
                placeholder="Nova sub-tarefa..."
                className="flex-1 px-2 py-1 text-xs border rounded-l-md"
              />
              <button onClick={() => handleAdicionarItem(hiperfoco.id, 'subtarefa', tarefa.id)} className="px-2 py-1 bg-hiperfocos-primary text-white rounded-r-md">
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  const hiperfocoSelecionado = hiperfocos.find(h => h.id === hiperfocoAtivo) || null
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Visualização em Árvore de Projetos</h2>
      
      {hiperfocos.length > 0 ? (
        <div>
          <div className="mb-6">
            <label htmlFor="hiperfoco-select" className="block text-sm font-medium mb-1">
              Selecione um Hiperfoco
            </label>
            <select
              id="hiperfoco-select"
              value={hiperfocoAtivo || ''}
              onChange={(e) => setHiperfocoAtivo(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              {hiperfocos.map((hiperfoco) => (
                <option key={hiperfoco.id} value={hiperfoco.id}>
                  {hiperfoco.titulo}
                </option>
              ))}
            </select>
          </div>
          
          {hiperfocoSelecionado && (
            <div>
              <div className="mb-4 p-3 rounded-md" style={{ backgroundColor: `${hiperfocoSelecionado.cor}20` }}>
                <h3 className="text-lg font-medium mb-1" style={{ color: hiperfocoSelecionado.cor }}>
                  {hiperfocoSelecionado.titulo}
                </h3>
                <p className="text-sm text-gray-600">{hiperfocoSelecionado.descricao}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {hiperfocoSelecionado.tarefas.filter(t => t.concluida).length} de {hiperfocoSelecionado.tarefas.length} tarefas concluídas
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                {hiperfocoSelecionado.tarefas.map((tarefa) => renderizarTarefa(hiperfocoSelecionado, tarefa))}
                <div className="flex items-center mt-4">
                    <input
                        type="text"
                        value={novoItemTexto}
                        onChange={(e) => setNovoItemTexto(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdicionarItem(hiperfocoSelecionado.id, 'tarefa')}
                        placeholder="Nova tarefa..."
                        className="flex-1 px-2 py-1 text-sm border rounded-l-md"
                    />
                    <button onClick={() => handleAdicionarItem(hiperfocoSelecionado.id, 'tarefa')} className="px-2 py-1 bg-hiperfocos-primary text-white rounded-r-md">
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 border-dashed border rounded-md">
          <p>Nenhum hiperfoco encontrado. Crie um na guia &quot;Conversor de Interesses&quot;.</p>
        </div>
      )}
    </div>
  )
}