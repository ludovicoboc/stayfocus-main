'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConcursosStore, Concurso, ConteudoProgramatico, SimuladoFavorito } from '@/app/stores/concursosStore';
import { useQuestoesStore, Questao } from '@/app/stores/questoesStore';
import { Button } from '@/app/components/ui/Button';
import { ConcursoForm } from '@/app/components/concursos/ConcursoForm';
import { QuestaoList } from '@/app/components/concursos/QuestaoList';
import { GeradorQuestoesLLM } from '@/app/components/concursos/GeradorQuestoesLLM';
import { QuestaoForm } from '@/app/components/concursos/QuestaoForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Award, Calendar, Edit, ExternalLink, Trash, BookOpen, ChevronDown, ChevronUp, Star, Edit2, X, Loader2 } from 'lucide-react';
import { Input } from '@/app/components/ui/Input';
import VisualizadorMarkdown from '@/app/components/estudos/VisualizadorMarkdown';
import { VisualizadorChecklist } from '@/app/components/estudos/VisualizadorChecklist';
import { Modal } from '@/app/components/ui/Modal';

interface DetalhesConcursoPageProps {
  params: { id: string };
}

export default function DetalhesConcursoPage({ params }: DetalhesConcursoPageProps) {
  const router = useRouter();
  const concursoId = Number(params.id);

  // --- Stores ---
  const { concursos, isLoading, removerConcurso, atualizarProgresso, fetchSimulados, adicionarSimulado, removerSimulado, atualizarSimulado } = useConcursosStore();
  const { initialize: initializeQuestoes } = useQuestoesStore();

  // --- State ---
  const [showQuestaoModal, setShowQuestaoModal] = useState(false);
  const [questaoParaEditar, setQuestaoParaEditar] = useState<Questao | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [materialModalTitle, setMaterialModalTitle] = useState('');
  const [isFileListModalOpen, setIsFileListModalOpen] = useState(false);
  const [filesForSelection, setFilesForSelection] = useState<{ id: string; name: string }[]>([]);
  const [selectedMaterialType, setSelectedMaterialType] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState('conteudo');
  const [disciplinasAbertas, setDisciplinasAbertas] = useState<Record<string, boolean>>({});
  const [editandoSimuladoId, setEditandoSimuladoId] = useState<number | null>(null);
  const [novoNomeSimulado, setNovoNomeSimulado] = useState('');

  // --- Effects ---
  useEffect(() => {
    if (concursoId) {
      initializeQuestoes(concursoId);
      fetchSimulados(concursoId);
    }
  }, [concursoId, initializeQuestoes, fetchSimulados]);

  const concurso = concursos.find(c => c.id === concursoId);

  // --- Handlers ---
  const handleRemover = async () => {
    if (concurso && confirm('Tem certeza?')) {
      await removerConcurso(concurso.id);
      router.push('/concursos');
    }
  };

  const handleProgressoChange = async (conteudoId: number, value: number) => {
    if (concurso) {
      await atualizarProgresso(concurso.id, conteudoId, value);
    }
  };

  const handleEditQuestaoClick = (questao: Questao) => {
    setQuestaoParaEditar(questao);
    setShowQuestaoModal(true);
  };

  const handleFavoritarSimulado = async (simulado: Omit<SimuladoFavorito, 'id' | 'concursoId'>) => {
    if(concurso) await adicionarSimulado(concurso.id, simulado);
  };

  const handleExcluirSimulado = async (id: number) => {
    if(concurso) await removerSimulado(concurso.id, id);
  };

  const handleSalvarNomeSimulado = async (id: number) => {
    if(concurso) await atualizarSimulado(concurso.id, id, { nome: novoNomeSimulado });
    setEditandoSimuladoId(null);
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!concurso) {
    return <div className="text-center py-12"><p>Concurso não encontrado.</p></div>;
  }

  const progressoGeral = Math.round((concurso.conteudoProgramatico.reduce((acc, curr) => acc + curr.progresso, 0)) / (concurso.conteudoProgramatico.length || 1));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2"><Award size={24} /><h1 className="text-2xl font-bold">{concurso.titulo}</h1></div>
          <p>{concurso.organizadora}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}><Edit size={16} className="mr-2" />Editar</Button>
          <Button variant="destructive" onClick={handleRemover}><Trash size={16} className="mr-2" />Remover</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <div><div className="text-sm text-gray-500">Data da Prova</div><div>{format(new Date(concurso.dataProva), 'dd/MM/yyyy', { locale: ptBR })}</div></div>
            <div><div className="text-sm text-gray-500">Inscrição</div><div>{format(new Date(concurso.dataInscricao), 'dd/MM/yyyy', { locale: ptBR })}</div></div>
            {concurso.edital && <div><a href={concurso.edital} target="_blank" rel="noopener noreferrer" className="text-indigo-600 flex items-center gap-1">Ver edital <ExternalLink size={14} /></a></div>}
        </div>
        <div>
            <div className="text-lg font-semibold mb-4">Progresso Geral</div>
            <div className="flex justify-between items-center text-sm mb-2"><span>Total</span><span>{progressoGeral}%</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progressoGeral}%` }}></div></div>
        </div>
      </div>

      <div className="flex gap-2 border-b mb-4">
        {['conteudo', 'gerar', 'questoes', 'simulados', 'materiais'].map(aba => (
          <Button key={aba} variant={abaAtiva === aba ? 'primary' : 'outline'} size="sm" onClick={() => setAbaAtiva(aba)}>{aba.charAt(0).toUpperCase() + aba.slice(1)}</Button>
        ))}
      </div>

      {abaAtiva === 'conteudo' && (
        <div className="space-y-4">
          {concurso.conteudoProgramatico.map((disciplina) => (
            <div key={disciplina.id} className="border rounded-lg">
              <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setDisciplinasAbertas(p => ({...p, [disciplina.disciplina]: !p[disciplina.disciplina]}))}>
                <h3 className="font-medium">{disciplina.disciplina}</h3>
                <div className="flex items-center gap-2">
                  <input type="range" min="0" max="100" value={disciplina.progresso} onChange={(e) => handleProgressoChange(disciplina.id, Number(e.target.value))} className="w-32" onClick={e => e.stopPropagation()} />
                  <span className="text-sm font-medium w-12">{disciplina.progresso}%</span>
                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); setDisciplinasAbertas(p => ({...p, [disciplina.disciplina]: !p[disciplina.disciplina]})); }}>
                    {disciplinasAbertas[disciplina.disciplina] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </Button>
                </div>
              </div>
              {disciplinasAbertas[disciplina.disciplina] && <ul className="list-disc list-inside px-6 pb-4">{disciplina.topicos.map((t, i) => <li key={i}>{t}</li>)}</ul>}
            </div>
          ))}
        </div>
      )}

      {abaAtiva === 'gerar' && <GeradorQuestoesLLM concursoId={concurso.id} />}
      {abaAtiva === 'questoes' && <QuestaoList concursoId={concurso.id} onAddQuestao={() => { setQuestaoParaEditar(null); setShowQuestaoModal(true); }} onEditQuestao={handleEditQuestaoClick} />}
      {abaAtiva === 'simulados' && (
        <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Star size={20} />Simulados Salvos</h2>
            {(concurso.simuladosFavoritos || []).length === 0 ? <p>Nenhum simulado favoritado.</p> : (
                <ul className="space-y-3">
                    {(concurso.simuladosFavoritos || []).map(simulado => (
                        <li key={simulado.id} className="border rounded-lg p-3 flex justify-between items-center">
                            <div>
                                {editandoSimuladoId === simulado.id ? (
                                    <div className="flex items-center gap-2">
                                        <Input value={novoNomeSimulado} onChange={e => setNovoNomeSimulado(e.target.value)} />
                                        <Button size="sm" onClick={() => handleSalvarNomeSimulado(simulado.id)}>Salvar</Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditandoSimuladoId(null)}>Cancelar</Button>
                                    </div>
                                ) : <span className="font-medium">{simulado.nome}</span>}
                                <div className="text-xs text-gray-500">{format(new Date(simulado.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="outline" onClick={() => router.push(simulado.link)}><ExternalLink size={16} /></Button>
                                <Button size="icon" variant="outline" onClick={() => {setEditandoSimuladoId(simulado.id); setNovoNomeSimulado(simulado.nome);}}><Edit2 size={16} /></Button>
                                <Button size="icon" variant="destructive" onClick={() => handleExcluirSimulado(simulado.id)}><X size={16} /></Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      )}

      <ConcursoForm isOpen={showEditModal} onClose={() => setShowEditModal(false)} concursoParaEditar={concurso} />
      <QuestaoForm isOpen={showQuestaoModal} onClose={() => setShowQuestaoModal(false)} concursoId={concurso.id} questaoParaEditar={questaoParaEditar} />
    </div>
  );
}