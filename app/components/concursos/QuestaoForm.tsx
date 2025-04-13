'use client';

import React, { useState, useEffect } from 'react';
import { useQuestoesStore, Questao, Alternativa } from '@/app/stores/questoesStore';
import { Modal } from '@/app/components/ui/Modal';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea';
import { Select } from '@/app/components/ui/Select';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { PlusCircle, Trash2 } from 'lucide-react';

interface QuestaoFormProps {
  isOpen: boolean;
  onClose: () => void;
  concursoId: string; // Para associar a questão ao concurso correto
  questaoParaEditar?: Questao | null;
}

const niveisDificuldade = [
  { value: 'facil', label: 'Fácil' },
  { value: 'medio', label: 'Médio' },
  { value: 'dificil', label: 'Difícil' },
];

export function QuestaoForm({ isOpen, onClose, concursoId, questaoParaEditar }: QuestaoFormProps) {
  const { adicionarQuestao, atualizarQuestao } = useQuestoesStore();

  // Estado inicial do formulário
  const initialState = {
    disciplina: '',
    topico: '',
    enunciado: '',
    alternativas: [{ id: crypto.randomUUID(), texto: '', correta: false }],
    justificativa: '',
    nivelDificuldade: 'medio',
    ano: new Date().getFullYear(),
    banca: '',
    tags: '', // Usar string separada por vírgula para simplicidade no input
  };

  const [formData, setFormData] = useState(initialState);
  const [respostaCorretaId, setRespostaCorretaId] = useState<string | null>(null);

  useEffect(() => {
    if (questaoParaEditar) {
      // Preenche o formulário com dados da questão para edição
      setFormData({
        disciplina: questaoParaEditar.disciplina,
        topico: questaoParaEditar.topico,
        enunciado: questaoParaEditar.enunciado,
        alternativas: questaoParaEditar.alternativas.map(a => ({ ...a })), // Cria cópias
        justificativa: questaoParaEditar.justificativa || '',
        nivelDificuldade: questaoParaEditar.nivelDificuldade || 'medio',
        ano: questaoParaEditar.ano || new Date().getFullYear(),
        banca: questaoParaEditar.banca || '',
        tags: questaoParaEditar.tags?.join(', ') || '',
      });
      setRespostaCorretaId(questaoParaEditar.respostaCorreta);
    } else {
      // Reseta para o estado inicial ao abrir para adicionar nova questão
      setFormData(initialState);
      setRespostaCorretaId(null);
    }
  }, [questaoParaEditar, isOpen]); // Depende de isOpen para resetar ao reabrir

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAlternativaChange = (id: string, texto: string) => {
    setFormData(prev => ({
      ...prev,
      alternativas: prev.alternativas.map(alt =>
        alt.id === id ? { ...alt, texto } : alt
      ),
    }));
  };

  const handleRespostaCorretaChange = (id: string) => {
    setRespostaCorretaId(id);
    setFormData(prev => ({
      ...prev,
      alternativas: prev.alternativas.map(alt => ({
        ...alt,
        correta: alt.id === id,
      })),
    }));
  };

  const adicionarAlternativa = () => {
    setFormData(prev => ({
      ...prev,
      alternativas: [...prev.alternativas, { id: crypto.randomUUID(), texto: '', correta: false }],
    }));
  };

  const removerAlternativa = (id: string) => {
    setFormData(prev => ({
      ...prev,
      alternativas: prev.alternativas.filter(alt => alt.id !== id),
    }));
    // Se remover a correta, desmarca
    if (respostaCorretaId === id) {
      setRespostaCorretaId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!respostaCorretaId) {
      alert('Por favor, marque uma alternativa como correta.');
      return;
    }

    // Garante que nivelDificuldade tenha o tipo correto
    const nivelDificuldadeTyped = formData.nivelDificuldade as 'facil' | 'medio' | 'dificil' | undefined;

    const questaoData = {
      ...formData,
      concursoId: concursoId,
      ano: Number(formData.ano) || undefined,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag), // Converte string para array
      respostaCorreta: respostaCorretaId,
      alternativas: formData.alternativas, // Já está no formato correto
      nivelDificuldade: nivelDificuldadeTyped, // Usa o valor com tipo corrigido
    };

    // Remove o ID ao adicionar uma nova questão, pois ele é gerado pelo store
    const questaoParaAdicionar = { ...questaoData };
    // delete questaoParaAdicionar.id; // O tipo Omit já faz isso implicitamente

    try {
      if (questaoParaEditar) {
        // Passa o ID da questão a ser editada e os dados atualizados
        // questaoData já contém os dados formatados corretamente (sem ID no objeto principal)
        atualizarQuestao(questaoParaEditar.id, questaoData);
      } else {
        // Passa os dados sem o ID para adicionar
        // questaoParaAdicionar já está formatado corretamente
        adicionarQuestao(questaoParaAdicionar);
      }
      onClose(); // Fecha o modal após sucesso
    } catch (error) {
      console.error("Erro ao salvar questão:", error);
      alert(`Erro ao salvar questão: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={questaoParaEditar ? 'Editar Questão' : 'Adicionar Nova Questão'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Disciplina"
          name="disciplina"
          value={formData.disciplina}
          onChange={handleChange}
          required
        />
        <Input
          label="Tópico (Opcional)"
          name="topico"
          value={formData.topico}
          onChange={handleChange}
        />
        <Textarea
          label="Enunciado"
          name="enunciado"
          value={formData.enunciado}
          onChange={handleChange}
          required
          rows={4}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alternativas</label>
          <div className="space-y-2">
            {formData.alternativas.map((alt, index) => (
              <div key={alt.id} className="flex items-center gap-2">
                {/* Assume que a prop de mudança é 'onChange' ou similar, não 'onCheckedChange' */}
                {/* O componente Checkbox provavelmente passa o novo estado (boolean) ou um evento */}
                <Checkbox
                  id={`correta-${alt.id}`}
                  checked={respostaCorretaId === alt.id}
                  // Tentativa com onChange. Se falhar, verificar ui/Checkbox.tsx
                  onChange={() => handleRespostaCorretaChange(alt.id)}
                />
                <Input
                  placeholder={`Alternativa ${index + 1}`}
                  value={alt.texto}
                  onChange={(e) => handleAlternativaChange(alt.id, e.target.value)}
                  required
                  className="flex-grow"
                />
                {formData.alternativas.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removerAlternativa(alt.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={adicionarAlternativa}
            className="mt-2"
          >
            <PlusCircle size={16} className="mr-2" />
            Adicionar Alternativa
          </Button>
        </div>

        <Textarea
          label="Justificativa (Opcional)"
          name="justificativa"
          value={formData.justificativa}
          onChange={handleChange}
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Nível de Dificuldade"
            name="nivelDificuldade"
            value={formData.nivelDificuldade}
            onChange={handleChange}
            options={niveisDificuldade}
          />
          <Input
            label="Ano (Opcional)"
            name="ano"
            type="number"
            value={formData.ano}
            onChange={handleChange}
            placeholder="Ex: 2023"
          />
          <Input
            label="Banca (Opcional)"
            name="banca"
            value={formData.banca}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Tags (separadas por vírgula, opcional)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Ex: Direito Administrativo, Licitações, Lei 8666"
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {questaoParaEditar ? 'Salvar Alterações' : 'Adicionar Questão'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
