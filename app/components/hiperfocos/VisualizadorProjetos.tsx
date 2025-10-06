'use client'

import { useState, useEffect } from 'react';
import { useHiperfocosStore, type Hiperfoco, type Tarefa } from '../../stores/hiperfocosStore';
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Check, Loader2 } from 'lucide-react';

export function VisualizadorProjetos() {
  const { 
    hiperfocos, 
    adicionarTarefa,
    atualizarTarefa,
    removerTarefa,
    isLoading,
    isInitialized
  } = useHiperfocosStore();
  
  const [hiperfocoAtivo, setHiperfocoAtivo] = useState<number | null>(null);
  const [expandidas, setExpandidas] = useState<Record<number, boolean>>({});
  const [novaSubtarefaTexto, setNovaSubtarefaTexto] = useState<Record<number, string>>({});
  const [editando, setEditando] = useState<Record<number, boolean>>({});
  const [textoEdicao, setTextoEdicao] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!hiperfocoAtivo && hiperfocos.length > 0) {
      setHiperfocoAtivo(hiperfocos[0].id);
    }
  }, [hiperfocos, hiperfocoAtivo]);
  
  const toggleExpand = (tarefaId: number) => setExpandidas(prev => ({ ...prev, [tarefaId]: !prev[tarefaId] }));
  
  const iniciarEdicao = (id: number, texto: string) => {
    setEditando(prev => ({ ...prev, [id]: true }));
    setTextoEdicao(prev => ({ ...prev, [id]: texto }));
  };
  
  const salvarEdicao = async (hiperfocoId: number, tarefaId: number) => {
    if (!textoEdicao[tarefaId]?.trim()) return;
    await atualizarTarefa(hiperfocoId, tarefaId, { texto: textoEdicao[tarefaId] });
    setEditando(prev => ({ ...prev, [tarefaId]: false }));
  };
  
  const handleAddSubtarefa = async (hiperfocoId: number, tarefaPaiId: number) => {
    const texto = novaSubtarefaTexto[tarefaPaiId]?.trim();
    if (!texto) return;
    await adicionarTarefa(hiperfocoId, texto, tarefaPaiId);
    setNovaSubtarefaTexto(prev => ({ ...prev, [tarefaPaiId]: '' }));
    setExpandidas(prev => ({ ...prev, [tarefaPaiId]: true }));
  };

  const renderizarTarefa = (hiperfoco: Hiperfoco, tarefa: Tarefa, isSubtarefa = false) => {
    const isExpanded = expandidas[tarefa.id] || false;
    const subtarefas = hiperfoco.subTarefas[tarefa.id] || [];
    const temSubtarefas = !isSubtarefa && subtarefas.length > 0;
    const isEditing = editando[tarefa.id] || false;
    
    return (
      <div key={tarefa.id} className={`${isSubtarefa ? 'ml-6' : 'border-l-2 pl-3 my-2'}`} style={{ borderColor: hiperfoco.cor }}>
        <div className="flex items-center">
          <button onClick={() => toggleExpand(tarefa.id)} className={`p-1 ${!temSubtarefas && 'invisible'}`}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <button onClick={() => atualizarTarefa(hiperfoco.id, tarefa.id, { concluida: !tarefa.concluida })} className={`p-1 rounded-md mr-2 ${tarefa.concluida ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Check className={`h-4 w-4 ${tarefa.concluida ? 'text-green-600' : 'text-gray-400'}`} />
          </button>
          {isEditing ? (
            <input type="text" value={textoEdicao[tarefa.id] || ''} onChange={(e) => setTextoEdicao({ ...textoEdicao, [tarefa.id]: e.target.value })} onBlur={() => salvarEdicao(hiperfoco.id, tarefa.id)} onKeyDown={(e) => e.key === 'Enter' && salvarEdicao(hiperfoco.id, tarefa.id)} className="flex-1 px-2 py-1 border rounded-md" autoFocus />
          ) : (
            <span className={`flex-1 text-sm ${tarefa.concluida ? 'line-through text-gray-500' : ''}`}>{tarefa.texto}</span>
          )}
          <div className="flex space-x-1 ml-2">
            <button onClick={() => iniciarEdicao(tarefa.id, tarefa.texto)} className="p-1"><Edit className="h-4 w-4" /></button>
            <button onClick={() => removerTarefa(hiperfoco.id, tarefa.id)} className="p-1"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
        {isExpanded && temSubtarefas && (
          <div className="mt-2">
            {subtarefas.map((sub) => renderizarTarefa(hiperfoco, sub, true))}
            <div className="flex items-center mt-2 ml-6">
              <input type="text" value={novaSubtarefaTexto[tarefa.id] || ''} onChange={(e) => setNovaSubtarefaTexto({ ...novaSubtarefaTexto, [tarefa.id]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleAddSubtarefa(hiperfoco.id, tarefa.id)} placeholder="Nova sub-tarefa..." className="flex-1 px-2 py-1 text-xs border rounded-l-md" />
              <button onClick={() => handleAddSubtarefa(hiperfoco.id, tarefa.id)} className="px-2 py-1 bg-hiperfocos-primary text-white rounded-r-md"><Plus className="h-3 w-3" /></button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const hiperfocoSelecionado = hiperfocos.find(h => h.id === hiperfocoAtivo) || null;

  if (isLoading && !isInitialized) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-hiperfocos-primary" /></div>;
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Visualização de Projetos</h2>
      {hiperfocos.length > 0 ? (
        <div>
          <div className="mb-6">
            <label htmlFor="hiperfoco-select" className="block text-sm font-medium mb-1">Selecione um Hiperfoco</label>
            <select id="hiperfoco-select" value={hiperfocoAtivo || ''} onChange={(e) => setHiperfocoAtivo(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md">
              {hiperfocos.map((hiperfoco) => <option key={hiperfoco.id} value={hiperfoco.id}>{hiperfoco.titulo}</option>)}
            </select>
          </div>
          {hiperfocoSelecionado && (
            <div>
              <div className="mb-4 p-3 rounded-md" style={{ backgroundColor: `${hiperfocoSelecionado.cor}20` }}>
                <h3 className="text-lg font-medium" style={{ color: hiperfocoSelecionado.cor }}>{hiperfocoSelecionado.titulo}</h3>
                {hiperfocoSelecionado.descricao && <p className="text-sm">{hiperfocoSelecionado.descricao}</p>}
                <div className="mt-2 text-xs">{hiperfocoSelecionado.tarefas.filter(t => t.concluida).length} de {hiperfocoSelecionado.tarefas.length} tarefas concluídas</div>
              </div>
              <div className="p-4 rounded-lg">
                {hiperfocoSelecionado.tarefas.filter(t => !t.tarefaPaiId).length > 0 ? (
                  <div>{hiperfocoSelecionado.tarefas.filter(t => !t.tarefaPaiId).map((tarefa) => renderizarTarefa(hiperfocoSelecionado, tarefa))}</div>
                ) : (
                  <p className="text-center py-4">Este hiperfoco não possui tarefas.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 border-dashed border rounded-md"><p>Nenhum hiperfoco encontrado.</p></div>
      )}
    </div>
  );
}