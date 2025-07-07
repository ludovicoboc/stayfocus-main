'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Modal } from '@/app/components/ui/Modal';
import { Calendar, Plus, X } from 'lucide-react';
import { useConcursosStore, type Concurso } from '@/app/stores/concursosStore';

interface ConcursoFormProps {
  isOpen: boolean;
  onClose: () => void;
  concursoParaEditar?: Concurso;
}

export function ConcursoForm({ isOpen, onClose, concursoParaEditar }: ConcursoFormProps) {
  const { adicionarConcurso, atualizarConcurso } = useConcursosStore();
  const [formData, setFormData] = useState({
    titulo: concursoParaEditar?.titulo || '',
    organizadora: concursoParaEditar?.organizadora || '',
    dataInscricao: concursoParaEditar?.dataInscricao || '',
    dataProva: concursoParaEditar?.dataProva || '',
    edital: concursoParaEditar?.edital || '',
    status: concursoParaEditar?.status || 'planejado',
    conteudoProgramatico: concursoParaEditar?.conteudoProgramatico || []
  });

  const [novaDisciplina, setNovaDisciplina] = useState('');
  const [novoTopico, setNovoTopico] = useState('');
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState('');
  const [loadingExtracao, setLoadingExtracao] = useState(false);
  const [extracaoErro, setExtracaoErro] = useState<string | null>(null);
  const [extracaoSucesso, setExtracaoSucesso] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (concursoParaEditar) {
      atualizarConcurso(concursoParaEditar.id, formData);
    } else {
      adicionarConcurso(formData);
    }
    
    onClose();
  };

  const adicionarDisciplina = () => {
    if (!novaDisciplina.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      conteudoProgramatico: [
        ...prev.conteudoProgramatico,
        {
          disciplina: novaDisciplina,
          topicos: [],
          progresso: 0
        }
      ]
    }));
    
    setNovaDisciplina('');
  };

  const adicionarTopico = () => {
    if (!novoTopico.trim() || !disciplinaSelecionada) return;
    
    setFormData(prev => ({
      ...prev,
      conteudoProgramatico: prev.conteudoProgramatico.map(d =>
        d.disciplina === disciplinaSelecionada
          ? { ...d, topicos: [...d.topicos, novoTopico] }
          : d
      )
    }));
    
    setNovoTopico('');
  };

  const removerDisciplina = (disciplina: string) => {
    setFormData(prev => ({
      ...prev,
      conteudoProgramatico: prev.conteudoProgramatico.filter(
        d => d.disciplina !== disciplina
      )
    }));
  };

  const removerTopico = (disciplina: string, topico: string) => {
    setFormData(prev => ({
      ...prev,
      conteudoProgramatico: prev.conteudoProgramatico.map(d =>
        d.disciplina === disciplina
          ? { ...d, topicos: d.topicos.filter(t => t !== topico) }
          : d
      )
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={concursoParaEditar ? "Editar Concurso" : "Novo Concurso"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Título
          </label>
          <Input
            value={formData.titulo}
            onChange={e => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            placeholder="Ex: Analista Administrativo - TRT"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Organizadora
          </label>
          <Input
            value={formData.organizadora}
            onChange={e => setFormData(prev => ({ ...prev, organizadora: e.target.value }))}
            placeholder="Ex: CESPE"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Data de Inscrição
            </label>
            <Input
              type="date"
              value={formData.dataInscricao}
              onChange={e => setFormData(prev => ({ ...prev, dataInscricao: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Data da Prova
            </label>
            <Input
              type="date"
              value={formData.dataProva}
              onChange={e => setFormData(prev => ({ ...prev, dataProva: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Link do Edital (opcional)
          </label>
          <div className="flex gap-2 items-start">
            <Input
              type="url"
              value={formData.edital}
              onChange={e => setFormData(prev => ({ ...prev, edital: e.target.value }))}
              placeholder="https://..."
              className="flex-grow"
            />
            <Button
              type="button"
              variant="outline"
              disabled={!formData.edital || loadingExtracao}
              onClick={async () => {
                if (!formData.edital) return;
                setLoadingExtracao(true);
                setExtracaoErro(null);
                setExtracaoSucesso(null);
                try {
                  // Chamada à API de extração (simulada)
                  // const response = await fetch('/api/extrair-edital', {
                  //   method: 'POST',
                  //   headers: { 'Content-Type': 'application/json' },
                  //   body: JSON.stringify({ url: formData.edital })
                  // });
                  // if (!response.ok) {
                  //   throw new Error('Erro ao extrair dados do edital.');
                  // }
                  // const data = await response.json();

                  // Simulação de resposta da API
                  await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay
                  const data = {
                    titulo: "Concurso Extraído (Mock)",
                    organizadora: "Banca Extraída (Mock)",
                    dataInscricao: "2025-07-01",
                    dataProva: "2025-09-15",
                    // Adicionar preço, etapas, cronograma se a API retornar
                    conteudoProgramatico: [
                      { disciplina: "Conhecimentos Gerais (Extraído)", topicos: ["Atualidades", "Ética"], progresso: 0 },
                      { disciplina: "Conhecimentos Específicos (Extraído)", topicos: ["Legislação X", "Técnica Y"], progresso: 0 }
                    ]
                  };

                  // Preencher campos do formulário com os dados extraídos
                  setFormData(prev => ({
                    ...prev,
                    ...data
                  }));
                  setExtracaoSucesso('Dados extraídos com sucesso!');
                } catch (err) {
                  setExtracaoErro('Erro ao extrair dados do edital.');
                } finally {
                  setLoadingExtracao(false);
                }
              }}
              className="whitespace-nowrap"
            >
              {loadingExtracao ? 'Extraindo...' : 'Extrair dados'}
            </Button>
          </div>
          {extracaoErro && <div className="text-xs text-red-600 mt-1">{extracaoErro}</div>}
          {extracaoSucesso && <div className="text-xs text-green-600 mt-1">{extracaoSucesso}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as Concurso['status'] }))}
            className="w-full border rounded-md p-2"
          >
            <option value="planejado">Planejado</option>
            <option value="inscrito">Inscrito</option>
            <option value="estudando">Estudando</option>
            <option value="realizado">Realizado</option>
            <option value="aguardando_resultado">Aguardando Resultado</option>
          </select>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-2">Conteúdo Programático</h3>
          
          <div className="space-y-4">
            {/* Adicionar Nova Disciplina */}
            <div className="flex gap-2">
              <Input
                value={novaDisciplina}
                onChange={e => setNovaDisciplina(e.target.value)}
                placeholder="Nova disciplina..."
              />
              <Button type="button" onClick={adicionarDisciplina}>
                <Plus size={16} />
              </Button>
            </div>

            {/* Lista de Disciplinas */}
            {formData.conteudoProgramatico.map((d, i) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{d.disciplina}</h4>
                  <button
                    type="button"
                    onClick={() => removerDisciplina(d.disciplina)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Adicionar Novo Tópico */}
                <div className="flex gap-2 mb-2">
                  <Input
                    value={disciplinaSelecionada === d.disciplina ? novoTopico : ''}
                    onChange={e => {
                      setDisciplinaSelecionada(d.disciplina);
                      setNovoTopico(e.target.value);
                    }}
                    placeholder="Novo tópico..."
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    onClick={adicionarTopico}
                    variant="outline"
                    className="p-2"
                    disabled={disciplinaSelecionada !== d.disciplina}
                  >
                    <Plus size={14} />
                  </Button>
                </div>

                {/* Lista de Tópicos */}
                <ul className="space-y-1">
                  {d.topicos.map((topico, j) => (
                    <li key={j} className="flex justify-between items-center text-sm">
                      <span>{topico}</span>
                      <button
                        type="button"
                        onClick={() => removerTopico(d.disciplina, topico)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {concursoParaEditar ? 'Salvar Alterações' : 'Adicionar Concurso'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
