'use client';

import React, { useState } from 'react';
import { Questao, Alternativa } from '@/app/stores/questoesStore';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
// Remover importações de componentes inexistentes
// import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
// import { Label } from "@/app/components/ui/label";
import { CheckCircle, XCircle, HelpCircle, EyeOff } from 'lucide-react';

interface QuestaoCardProps {
  questao: Questao;
  modo: 'estudo' | 'simulado' | 'revisao'; // Modos diferentes podem ter UIs ligeiramente diferentes
  onResponder?: (questaoId: string, respostaUsuario: string, acertou: boolean) => void;
  numeroQuestao?: number; // Opcional, para exibir numeração
}

// Mapeamento de cores para disciplinas (exemplo, pode ser configurável)
const coresDisciplinas: { [key: string]: string } = {
  'Português': 'bg-blue-100 border-blue-300',
  'Matemática': 'bg-green-100 border-green-300',
  'Direito Administrativo': 'bg-yellow-100 border-yellow-300',
  'Direito Constitucional': 'bg-purple-100 border-purple-300',
  'Informática': 'bg-red-100 border-red-300',
  'default': 'bg-gray-100 border-gray-300',
};

export function QuestaoCard({ questao, modo, onResponder, numeroQuestao }: QuestaoCardProps) {
  const [respostaSelecionada, setRespostaSelecionada] = useState<string | undefined>(
    modo === 'revisao' ? questao.respostaUsuario : undefined
  );
  const [mostrarJustificativa, setMostrarJustificativa] = useState(modo === 'revisao');
  const [interfaceSimplificada, setInterfaceSimplificada] = useState(false);
  const [mostrarDica, setMostrarDica] = useState(false); // Para sistema progressivo de dicas

  const handleResposta = (valor: string) => {
    if (modo === 'revisao') return; // Não permite mudar resposta na revisão
    setRespostaSelecionada(valor);
    if (modo === 'simulado' && onResponder) {
      const acertou = valor === questao.respostaCorreta;
      onResponder(questao.id, valor, acertou);
      // Em modo simulado, geralmente não mostra a resposta imediatamente
    }
    if (modo === 'estudo') {
      setMostrarJustificativa(true); // Mostra justificativa ao responder em modo estudo
    }
  };

  const getCorDisciplina = (disciplina: string) => {
    return coresDisciplinas[disciplina] || coresDisciplinas['default'];
  };

  const getStatusAlternativa = (alt: Alternativa): 'correta' | 'incorreta' | 'neutra' => {
    if (modo !== 'revisao' && !mostrarJustificativa) return 'neutra';
    if (alt.correta) return 'correta';
    if (respostaSelecionada === alt.id && !alt.correta) return 'incorreta';
    return 'neutra';
  };

  const corBorda = getCorDisciplina(questao.disciplina);

  return (
    <Card className={`transition-all hover:shadow-md border-l-4 ${corBorda} ${interfaceSimplificada ? 'p-2' : 'p-4'}`}>
      <div className={` ${interfaceSimplificada ? 'space-y-1' : 'space-y-3'}`}>
        {/* Cabeçalho da Questão */}
        <div className="flex justify-between items-start text-xs text-gray-500">
          <div>
            {numeroQuestao && <span className="font-bold mr-2">Questão {numeroQuestao}</span>}
            <span>{questao.disciplina} {questao.topico ? `> ${questao.topico}` : ''}</span>
            {questao.banca && ` (${questao.banca}${questao.ano ? `, ${questao.ano}` : ''})`}
          </div>
          {/* Botões de controle da interface */}
          <div className="flex gap-2">
            {questao.justificativa && (
              <Button variant="ghost" size="sm" onClick={() => setMostrarDica(!mostrarDica)} title="Mostrar Dica/Justificativa">
                <HelpCircle size={14} />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setInterfaceSimplificada(!interfaceSimplificada)} title={interfaceSimplificada ? "Mostrar Interface Completa" : "Simplificar Interface"}>
              <EyeOff size={14} />
            </Button>
          </div>
        </div>

        {/* Enunciado */}
        <p className={`font-medium ${interfaceSimplificada ? 'text-sm' : 'text-base'}`}>{questao.enunciado}</p>

        {/* Alternativas (usando HTML padrão) */}
        <div className="space-y-2">
          {questao.alternativas.map((alt) => {
            const status = getStatusAlternativa(alt);
            let statusClasses = '';
            if (status === 'correta') statusClasses = 'text-green-700 font-semibold';
            if (status === 'incorreta') statusClasses = 'text-red-700 line-through';
            const inputId = `q-${questao.id}-alt-${alt.id}`;

            return (
              <div
                key={alt.id}
                className={`flex items-center space-x-3 p-2 rounded border ${
                  status === 'correta' ? 'bg-green-50 border-green-200' : ''
                } ${
                  status === 'incorreta' ? 'bg-red-50 border-red-200' : ''
                } ${
                  status === 'neutra' ? 'border-transparent hover:bg-gray-50' : ''
                }`}
              >
                <input
                  type="radio"
                  id={inputId}
                  name={`questao-${questao.id}`} // Agrupa os radios da mesma questão
                  value={alt.id}
                  checked={respostaSelecionada === alt.id}
                  onChange={(e) => handleResposta(e.target.value)}
                  disabled={modo === 'revisao'}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor={inputId} className={`flex-1 cursor-pointer ${statusClasses}`}>
                  {alt.texto}
                </label>
                {status === 'correta' && <CheckCircle size={16} className="text-green-600 flex-shrink-0" />}
                {status === 'incorreta' && <XCircle size={16} className="text-red-600 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Justificativa / Dica */}
        {(mostrarJustificativa || (mostrarDica && questao.justificativa)) && (
          <div className={`mt-3 pt-3 border-t text-sm ${interfaceSimplificada ? 'p-1 bg-gray-50 rounded' : 'p-3 bg-gray-50 rounded'}`}>
            <p className="font-semibold mb-1">Justificativa:</p>
            <p className="text-gray-700">{questao.justificativa || 'Sem justificativa cadastrada.'}</p>
          </div>
        )}

        {/* Botão de confirmação (opcional, mais útil em modo estudo) */}
        {modo === 'estudo' && !mostrarJustificativa && respostaSelecionada && (
          <div className="flex justify-end mt-3">
            <Button size="sm" onClick={() => setMostrarJustificativa(true)}>Confirmar Resposta</Button>
          </div>
        )}
      </div>
    </Card>
  );
}
