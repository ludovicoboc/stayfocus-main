'use client'

import { useState } from 'react';
import { useFinancasStore } from '@/app/stores/financasStore';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';

export function EnvelopesVirtuais() {
  const { envelopes, adicionarEnvelope, atualizarEnvelope, removerEnvelope, isLoading, isInitialized } = useFinancasStore();
  
  const [novoEnvelope, setNovoEnvelope] = useState({ nome: '', cor: '#2196F3', valorAlocado: 0 });
  const [valorGasto, setValorGasto] = useState<{id: number, valor: number} | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const coresPredefinidas = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF9800', '#00BCD4'];
  
  const cancelarForm = () => {
    setNovoEnvelope({ nome: '', cor: '#2196F3', valorAlocado: 0 });
    setEditando(null);
    setMostrarFormulario(false);
  };

  const handleAdicionarEnvelope = async () => {
    if (!novoEnvelope.nome || novoEnvelope.valorAlocado <= 0) return;
    await adicionarEnvelope({ nome: novoEnvelope.nome, cor: novoEnvelope.cor, valorAlocado: novoEnvelope.valorAlocado });
    cancelarForm();
  };
  
  const iniciarEdicao = (id: number) => {
    const envelope = envelopes.find(e => e.id === id);
    if (envelope) {
      setNovoEnvelope({ nome: envelope.nome, cor: envelope.cor, valorAlocado: envelope.valorAlocado });
      setEditando(id);
      setMostrarFormulario(true);
    }
  };
  
  const salvarEdicao = async () => {
    if (!editando || !novoEnvelope.nome || novoEnvelope.valorAlocado <= 0) return;
    await atualizarEnvelope(editando, { nome: novoEnvelope.nome, cor: novoEnvelope.cor, valorAlocado: novoEnvelope.valorAlocado });
    cancelarForm();
  };
  
  const handleRegistrarGasto = async (id: number) => {
    if (!valorGasto || !valorGasto.valor || valorGasto.valor <= 0) return;
    await atualizarEnvelope(id, { gasto: valorGasto.valor });
    setValorGasto(null);
  };

  if (isLoading && !isInitialized) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-financas-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {envelopes.map(envelope => {
          const percentualUtilizado = envelope.valorAlocado > 0 ? (envelope.valorUtilizado / envelope.valorAlocado) * 100 : 0;
          return (
            <div key={envelope.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-3" style={{ backgroundColor: `${envelope.cor}20` }}>
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: envelope.cor }} />
                  <span className="font-medium">{envelope.nome}</span>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => iniciarEdicao(envelope.id)} className="p-1"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => removerEnvelope(envelope.id)} className="p-1"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Utilizado: {formatadorMoeda.format(envelope.valorUtilizado)}</span>
                  <span>Total: {formatadorMoeda.format(envelope.valorAlocado)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full" style={{ width: `${Math.min(percentualUtilizado, 100)}%`, backgroundColor: envelope.cor }} />
                </div>
                {valorGasto?.id === envelope.id ? (
                  <div className="flex mt-2">
                    <input type="number" value={valorGasto.valor || ''} onChange={e => setValorGasto({ id: envelope.id, valor: parseFloat(e.target.value) || 0 })} placeholder="Valor" className="flex-1 px-2 py-1 border rounded-l" min="0.01" step="0.01" />
                    <button onClick={() => handleRegistrarGasto(envelope.id)} className="px-2 py-1 bg-blue-500 text-white rounded-r"><Save className="h-4 w-4" /></button>
                    <button onClick={() => setValorGasto(null)} className="px-2 py-1 ml-1 bg-gray-500 text-white rounded"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <button onClick={() => setValorGasto({ id: envelope.id, valor: 0 })} className="w-full mt-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-md">Registrar Gasto</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {mostrarFormulario ? (
        <div className="border rounded-lg p-3">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Nome do Envelope</label>
              <input type="text" value={novoEnvelope.nome} onChange={e => setNovoEnvelope({ ...novoEnvelope, nome: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium">Valor Alocado</label>
              <input type="number" value={novoEnvelope.valorAlocado || ''} onChange={e => setNovoEnvelope({ ...novoEnvelope, valorAlocado: parseFloat(e.target.value) || 0 })} className="mt-1 w-full px-3 py-2 border rounded-md" min="0.01" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor</label>
              <div className="flex flex-wrap gap-2">
                {coresPredefinidas.map(cor => <button key={cor} type="button" onClick={() => setNovoEnvelope({ ...novoEnvelope, cor })} className={`w-8 h-8 rounded-full ${novoEnvelope.cor === cor ? 'ring-2' : ''}`} style={{ backgroundColor: cor }} />)}
              </div>
            </div>
            <div className="flex space-x-2 pt-2">
              <button onClick={editando ? salvarEdicao : handleAdicionarEnvelope} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded">Salvar</button>
              <button onClick={cancelarForm} className="flex-1 px-4 py-2 bg-gray-300 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setMostrarFormulario(true)} className="w-full px-4 py-2 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md">
          <Plus className="h-5 w-5 mr-1" /> Novo Envelope
        </button>
      )}
    </div>
  );
}