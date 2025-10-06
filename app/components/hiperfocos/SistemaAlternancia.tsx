'use client'

import { useState, FormEvent } from 'react';
import { ArrowRightCircle, Clock, Plus, Check, AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { useHiperfocosStore, type SessaoAlternancia, type Hiperfoco } from '../../stores/hiperfocosStore';
import { format, parseISO, isAfter, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SistemaAlternancia() {
  const { 
    hiperfocos, 
    sessoes, 
    adicionarSessao, 
    atualizarSessao,
    isLoading,
    isInitialized
  } = useHiperfocosStore();
  
  const [novaAlternancia, setNovaAlternancia] = useState({
    titulo: '',
    hiperfocoId: '',
    tempoEstimado: ''
  });
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  
  const sessoesAtivas = sessoes.filter(sessao => !sessao.concluida);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!novaAlternancia.titulo || !novaAlternancia.hiperfocoId || !novaAlternancia.tempoEstimado) {
      setFeedbackMsg('Por favor, preencha todos os campos');
      return;
    }
    
    const tempoEstimadoInt = parseInt(novaAlternancia.tempoEstimado);
    if (isNaN(tempoEstimadoInt) || tempoEstimadoInt <= 0) {
      setFeedbackMsg('Tempo estimado inválido');
      return;
    }
    
    try {
      await adicionarSessao({
        titulo: novaAlternancia.titulo,
        hiperfocoAtualId: parseInt(novaAlternancia.hiperfocoId),
        duracaoEstimada: tempoEstimadoInt
      });
      
      setNovaAlternancia({ titulo: '', hiperfocoId: '', tempoEstimado: '' });
      setMostrarFormulario(false);
      setFeedbackMsg(null);
    } catch (error) {
      setFeedbackMsg('Erro ao criar a sessão');
      console.error(error);
    }
  };
  
  const getHiperfocoNome = (id: number | null): string => {
    if (!id) return 'Nenhum';
    const hiperfoco = hiperfocos.find(h => h.id === id);
    return hiperfoco ? hiperfoco.titulo : 'Desconhecido';
  };
  
  const isSessionOverdue = (sessao: SessaoAlternancia): boolean => {
    const inicioDate = parseISO(sessao.tempoInicio);
    const limiteDate = addMinutes(inicioDate, sessao.duracaoEstimada);
    return isAfter(new Date(), limiteDate);
  };
  
  const handleAlternarHiperfoco = async (sessaoId: number, novoHiperfocoId: string) => {
    await atualizarSessao(sessaoId, { novoHiperfocoId: parseInt(novoHiperfocoId) });
  };

  const handleConcluirSessao = async (sessaoId: number) => {
    await atualizarSessao(sessaoId, { concluida: true });
  };

  if (isLoading && !isInitialized) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-hiperfocos-primary" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <RefreshCcw className="h-6 w-6 text-hiperfocos-primary mr-2" />
        <h2 className="text-xl font-semibold">Sistema de Alternância</h2>
      </div>
      <p className="text-gray-600 mb-6">Gerencie transições entre diferentes hiperfocos.</p>
      
      {feedbackMsg && <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4"><AlertCircle className="h-5 w-5 inline mr-2" />{feedbackMsg}</div>}
      
      {sessoesAtivas.length > 0 ? (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium">Sessões Ativas</h3>
          {sessoesAtivas.map((sessao) => {
            const isOverdue = isSessionOverdue(sessao);
            const hiperfocoAtual = hiperfocos.find(h => h.id === sessao.hiperfocoAtualId);
            return (
              <div key={sessao.id} className={`p-4 border-l-4 rounded-lg ${isOverdue ? 'border-amber-500' : 'border-hiperfocos-primary'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{sessao.titulo}</h4>
                    <p className="text-sm text-gray-500"><Clock className="h-4 w-4 inline mr-1" />Iniciado: {format(parseISO(sessao.tempoInicio), "dd/MM, HH:mm", { locale: ptBR })}</p>
                  </div>
                  <button onClick={() => handleConcluirSessao(sessao.id)} className="p-1.5"><Check className="h-5 w-5" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-md" style={{ backgroundColor: hiperfocoAtual ? `${hiperfocoAtual.cor}20` : 'transparent' }}>
                    <span className="text-sm font-medium block mb-1">Hiperfoco Atual</span>
                    <div className="px-3 py-1.5 rounded-md text-sm font-medium" style={{ color: hiperfocoAtual ? hiperfocoAtual.cor : 'inherit' }}>{getHiperfocoNome(sessao.hiperfocoAtualId)}</div>
                  </div>
                  <div className="p-3 rounded-md">
                    <span className="text-sm font-medium block mb-1">Alternar para</span>
                    <select className="w-full px-3 py-1.5 border rounded-md" value="" onChange={(e) => handleAlternarHiperfoco(sessao.id, e.target.value)}>
                      <option value="" disabled>Escolha um hiperfoco</option>
                      {hiperfocos.filter(h => h.id !== sessao.hiperfocoAtualId).map(hiperfoco => <option key={hiperfoco.id} value={hiperfoco.id}>{hiperfoco.titulo}</option>)}
                    </select>
                  </div>
                </div>
                {sessao.hiperfocoAnteriorId && <div className="mt-3 text-sm text-gray-500"><ArrowRightCircle className="h-4 w-4 inline mr-1" />Alternou de: {getHiperfocoNome(sessao.hiperfocoAnteriorId)}</div>}
                {isOverdue && <div className="mt-3 text-sm text-amber-500"><AlertCircle className="h-4 w-4 inline mr-1" />Tempo estimado excedido!</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 mb-6"><p>Nenhuma sessão de alternância ativa.</p></div>
      )}
      
      {mostrarFormulario ? (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-4">Nova Sessão</h3>
          <div className="space-y-4">
            <Input label="Título da Sessão" value={novaAlternancia.titulo} onChange={(e) => setNovaAlternancia({ ...novaAlternancia, titulo: e.target.value })} placeholder="Ex: Sessão de estudo" />
            <Select label="Hiperfoco Inicial" value={novaAlternancia.hiperfocoId} onChange={(e) => setNovaAlternancia({ ...novaAlternancia, hiperfocoId: e.target.value })} options={hiperfocos.map(h => ({ value: h.id.toString(), label: h.titulo }))} />
            <Input label="Tempo Estimado (minutos)" type="number" value={novaAlternancia.tempoEstimado} onChange={(e) => setNovaAlternancia({ ...novaAlternancia, tempoEstimado: e.target.value })} min="1" placeholder="Ex: 30" />
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <Button type="button" onClick={() => setMostrarFormulario(false)} variant="outline">Cancelar</Button>
            <Button type="submit">Iniciar Sessão</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setMostrarFormulario(true)} disabled={hiperfocos.length === 0}><Plus className="h-5 w-5 mr-2" />Nova Sessão de Alternância</Button>
      )}
      
      {hiperfocos.length === 0 && <div className="text-center py-4 text-gray-500 border-dashed border rounded-md"><p>Crie hiperfocos na guia "Conversor de Interesses" para iniciar.</p></div>}
    </div>
  );
}