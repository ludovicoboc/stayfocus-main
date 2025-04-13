'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConcursosStore } from '@/app/stores/concursosStore';
import { useQuestoesStore, Questao } from '@/app/stores/questoesStore';
import { Button } from '@/app/components/ui/Button';
import { ConcursoForm } from '@/app/components/concursos/ConcursoForm';
import { QuestaoList } from '@/app/components/concursos/QuestaoList';
import { GeradorQuestoesLLM } from '@/app/components/concursos/GeradorQuestoesLLM';
import { QuestaoForm } from '@/app/components/concursos/QuestaoForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Award, Calendar, Edit, ExternalLink, Trash, BookOpen, ChevronDown, ChevronUp, Star, StarOff, Edit2, X } from 'lucide-react';
import { Input } from '@/app/components/ui/Input';

interface DetalhesConcursoPageProps {
  params: {
    id: string;
  };
}

interface SimuladoFavorito {
  id: string;
  nome: string;
  data: string;
  link: string;
}

export default function DetalhesConcursoPage({ params }: DetalhesConcursoPageProps) {
  const router = useRouter();
  const { concursos, removerConcurso, atualizarProgresso } = useConcursosStore();
  const [showQuestaoModal, setShowQuestaoModal] = useState(false);
  const [questaoParaEditar, setQuestaoParaEditar] = useState<Questao | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Abas principais
  const abas = [
    { key: 'conteudo', label: 'Conteúdo Programático' },
    { key: 'gerar', label: 'Gerar Questões Automáticas' },
    { key: 'questoes', label: 'Questões do Concurso' },
    { key: 'simulados', label: 'Simulados Salvos' }
  ];
  const [abaAtiva, setAbaAtiva] = useState('conteudo');

  // Collapse/expand do conteúdo programático
  const concurso = concursos.find(c => c.id === params.id);
  const [disciplinasAbertas, setDisciplinasAbertas] = useState<{ [disciplina: string]: boolean }>({});

  // Simulados favoritos (armazenados no localStorage por concurso)
  const storageKey = `simulados_favoritos_${params.id}`;
  const [simuladosFavoritos, setSimuladosFavoritos] = useState<SimuladoFavorito[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem(storageKey) || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });
  const [editandoSimuladoId, setEditandoSimuladoId] = useState<string | null>(null);
  const [novoNomeSimulado, setNovoNomeSimulado] = useState('');

  if (!concurso) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Concurso não encontrado</p>
        <Button variant="outline" onClick={() => router.push('/concursos')} className="mt-4">
          Voltar para Concursos
        </Button>
      </div>
    );
  }

  const handleRemover = () => {
    if (confirm('Tem certeza que deseja remover este concurso?')) {
      removerConcurso(concurso.id);
      router.push('/concursos');
    }
  };

  const handleProgressoChange = (disciplina: string, value: number) => {
    atualizarProgresso(concurso.id, disciplina, value);
  };

  const handleAddQuestaoClick = () => {
    setQuestaoParaEditar(null);
    setShowQuestaoModal(true);
  };

  const handleEditQuestaoClick = (questao: Questao) => {
    setQuestaoParaEditar(questao);
    setShowQuestaoModal(true);
  };

  const handleCloseQuestaoModal = () => {
    setShowQuestaoModal(false);
    setQuestaoParaEditar(null);
  };

  // Collapse/expand handler
  const toggleDisciplina = (disciplina: string) => {
    setDisciplinasAbertas(prev => ({
      ...prev,
      [disciplina]: !prev[disciplina]
    }));
  };

  // Simulados favoritos handlers
  const handleFavoritarSimulado = (simulado: SimuladoFavorito) => {
    const novos = [...simuladosFavoritos, simulado];
    setSimuladosFavoritos(novos);
    localStorage.setItem(storageKey, JSON.stringify(novos));
  };

  const handleExcluirSimulado = (id: string) => {
    const novos = simuladosFavoritos.filter(s => s.id !== id);
    setSimuladosFavoritos(novos);
    localStorage.setItem(storageKey, JSON.stringify(novos));
  };

  const handleEditarNomeSimulado = (id: string) => {
    setEditandoSimuladoId(id);
    const simulado = simuladosFavoritos.find(s => s.id === id);
    setNovoNomeSimulado(simulado?.nome || '');
  };

  const handleSalvarNomeSimulado = (id: string) => {
    const novos = simuladosFavoritos.map(s =>
      s.id === id ? { ...s, nome: novoNomeSimulado } : s
    );
    setSimuladosFavoritos(novos);
    localStorage.setItem(storageKey, JSON.stringify(novos));
    setEditandoSimuladoId(null);
    setNovoNomeSimulado('');
  };

  const progressoGeral = Math.round(
    (concurso.conteudoProgramatico.reduce((acc, curr) => acc + curr.progresso, 0)) /
    (concurso.conteudoProgramatico.length || 1)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-bold">{concurso.titulo}</h1>
          </div>
          <p className="text-gray-500">{concurso.organizadora}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit size={16} className="mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleRemover}>
            <Trash size={16} className="mr-2" />
            Remover
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-gray-500" />
            <div>
              <div className="text-sm text-gray-500">Data da Prova</div>
              <div>{format(new Date(concurso.dataProva), 'dd/MM/yyyy', { locale: ptBR })}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Inscrição</div>
            <div>{format(new Date(concurso.dataInscricao), 'dd/MM/yyyy', { locale: ptBR })}</div>
          </div>
          {concurso.edital && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Edital</div>
              <a
                href={concurso.edital}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Ver edital <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
        <div>
          <div className="text-lg font-semibold mb-4">Progresso Geral</div>
          <div className="flex justify-between items-center text-sm mb-2">
            <span>Total concluído</span>
            <span className="font-medium">{progressoGeral}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${progressoGeral}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Abas principais */}
      <div className="flex gap-2 border-b mb-4">
        {abas.map((aba) => (
          <Button
            key={aba.key}
            variant={abaAtiva === aba.key ? 'primary' : 'outline'}
            size="sm"
            className={`rounded-b-none ${abaAtiva === aba.key ? 'border-b-2 border-blue-600' : ''}`}
            onClick={() => setAbaAtiva(aba.key)}
          >
            {aba.label}
          </Button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      {abaAtiva === 'conteudo' && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={20} /> Conteúdo Programático
          </h2>
          <div className="space-y-4">
            {concurso.conteudoProgramatico.map((disciplina, index) => {
              const aberta = disciplinasAbertas[disciplina.disciplina] ?? true;
              return (
                <div key={index} className="border rounded-lg">
                  <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => toggleDisciplina(disciplina.disciplina)}>
                    <h3 className="font-medium">{disciplina.disciplina}</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={disciplina.progresso}
                        onChange={(e) => handleProgressoChange(disciplina.disciplina, Number(e.target.value))}
                        className="w-32"
                        onClick={e => e.stopPropagation()}
                      />
                      <span className="text-sm font-medium w-12">{disciplina.progresso}%</span>
                      <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); toggleDisciplina(disciplina.disciplina); }}>
                        {aberta ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </Button>
                    </div>
                  </div>
                  {aberta && (
                    <ul className="list-disc list-inside space-y-1 px-6 pb-4">
                      {disciplina.topicos.map((topico, topicoIndex) => (
                        <li key={topicoIndex} className="text-sm text-gray-600">
                          {topico}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {abaAtiva === 'gerar' && (
        <div>
          <GeradorQuestoesLLM concursoId={concurso.id} />
        </div>
      )}

      {abaAtiva === 'questoes' && (
        <div>
          <QuestaoList
            concursoId={concurso.id}
            onAddQuestao={handleAddQuestaoClick}
            onEditQuestao={handleEditQuestaoClick}
          />
        </div>
      )}

      {abaAtiva === 'simulados' && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star size={20} /> Simulados Salvos
          </h2>
          {simuladosFavoritos.length === 0 ? (
            <p className="text-gray-500">Nenhum simulado favoritado ainda.</p>
          ) : (
            <ul className="space-y-3">
              {simuladosFavoritos.map((simulado) => (
                <li key={simulado.id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    {editandoSimuladoId === simulado.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={novoNomeSimulado}
                          onChange={e => setNovoNomeSimulado(e.target.value)}
                        />
                        <Button size="sm" variant="success" onClick={() => handleSalvarNomeSimulado(simulado.id)}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditandoSimuladoId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <span className="font-medium">{simulado.nome}</span>
                    )}
                    <div className="text-xs text-gray-500">{format(new Date(simulado.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => router.push(simulado.link)} title="Abrir simulado">
                      <ExternalLink size={16} />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => handleEditarNomeSimulado(simulado.id)} title="Editar nome">
                      <Edit2 size={16} />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleExcluirSimulado(simulado.id)} title="Excluir">
                      <X size={16} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal/Form para Adicionar/Editar Concurso */}
      <ConcursoForm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        concursoParaEditar={concurso}
      />

      {/* Modal/Form para Adicionar/Editar Questão */}
      <QuestaoForm
        isOpen={showQuestaoModal}
        onClose={handleCloseQuestaoModal}
        concursoId={concurso.id}
        questaoParaEditar={questaoParaEditar}
      />
    </div>
  );
}
