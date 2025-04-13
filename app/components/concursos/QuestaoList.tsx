'use client';

import React, { useState } from 'react';
import { useQuestoesStore, Questao } from '@/app/stores/questoesStore';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Edit, Trash, Plus, PlayCircle } from 'lucide-react';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { useRouter } from 'next/navigation';

interface QuestaoListProps {
  concursoId: string;
  onAddQuestao: () => void;
  onEditQuestao: (questao: Questao) => void;
}

export function QuestaoList({ concursoId, onAddQuestao, onEditQuestao }: QuestaoListProps) {
  const { questoes, removerQuestao } = useQuestoesStore((state) => ({
    questoes: state.questoes.filter(q => q.concursoId === concursoId),
    removerQuestao: state.removerQuestao,
  }));

  // Agrupa questões por disciplina
  const disciplinas = Array.from(new Set(questoes.map(q => q.disciplina)));
  const [abaAtiva, setAbaAtiva] = useState(disciplinas[0] || '');
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const router = useRouter();

  const handleRemover = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta questão?')) {
      removerQuestao(id);
      setSelecionadas(selecionadas.filter(qid => qid !== id));
    }
  };

  const handleSelecionar = (id: string, checked: boolean) => {
    setSelecionadas((prev) =>
      checked ? [...prev, id] : prev.filter(qid => qid !== id)
    );
  };

  const handleSelecionarTodas = (checked: boolean) => {
    const idsDaAba = questoes.filter(q => q.disciplina === abaAtiva).map(q => q.id);
    setSelecionadas((prev) =>
      checked
        ? Array.from(new Set([...prev, ...idsDaAba]))
        : prev.filter(qid => !idsDaAba.includes(qid))
    );
  };

  const handleRealizarSimulado = () => {
    // Salva as questões selecionadas no localStorage para a página de simulado buscar
    const questoesSelecionadas = questoes.filter(q => selecionadas.includes(q.id));
    localStorage.setItem('simulado_personalizado_questoes', JSON.stringify(questoesSelecionadas));
    router.push('/estudos/simulado-personalizado');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Questões do Concurso</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleRealizarSimulado}
            size="sm"
            variant="success"
            disabled={selecionadas.length === 0}
            className="flex items-center"
          >
            <PlayCircle size={16} className="mr-2" />
            Realizar Simulado
          </Button>
          <Button onClick={onAddQuestao} size="sm">
            <Plus size={16} className="mr-2" />
            Adicionar Questão
          </Button>
        </div>
      </div>

      {/* Abas de disciplinas */}
      <div className="flex gap-2 mb-4">
        {disciplinas.map((disciplina) => (
          <button
            key={disciplina}
            className={`px-4 py-2 rounded-t ${abaAtiva === disciplina ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setAbaAtiva(disciplina)}
          >
            {disciplina}
          </button>
        ))}
      </div>

      {/* Lista de questões da aba ativa */}
      {questoes.filter(q => q.disciplina === abaAtiva).length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center mb-2">
            <Checkbox
              checked={
                questoes.filter(q => q.disciplina === abaAtiva).every(q => selecionadas.includes(q.id))
              }
              onChange={e => handleSelecionarTodas(e.target.checked)}
              label="Selecionar todas"
            />
          </div>
          {questoes
            .filter(q => q.disciplina === abaAtiva)
            .map((questao) => (
              <Card key={questao.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selecionadas.includes(questao.id)}
                      onChange={e => handleSelecionar(questao.id, e.target.checked)}
                    />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {questao.disciplina} {questao.topico ? `> ${questao.topico}` : ''}
                        {questao.banca && ` (${questao.banca}${questao.ano ? `, ${questao.ano}` : ''})`}
                      </p>
                      <p className="font-medium">{questao.enunciado}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <Button variant="outline" size="icon" onClick={() => onEditQuestao(questao)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleRemover(questao.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-3">Nenhuma questão cadastrada para esta disciplina ainda.</p>
          <Button variant="outline" onClick={onAddQuestao}>
            <Plus size={16} className="mr-2" />
            Adicionar a primeira questão
          </Button>
        </div>
      )}
    </div>
  );
}
