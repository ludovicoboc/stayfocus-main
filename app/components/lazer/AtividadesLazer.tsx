'use client'

import { useState, useMemo } from 'react';
import { Plus, Trash, Clock, Calendar, Bookmark, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea';
import { Badge } from '@/app/components/ui/Badge';
import { Select } from '@/app/components/ui/Select';
import { StatCard } from '@/app/components/ui/StatCard';
import { Alert } from '@/app/components/ui/Alert';
import { useAtividadesStore, Atividade } from '@/app/stores/atividadesStore';

export function AtividadesLazer() {
  const { atividades, adicionarAtividade, removerAtividade, marcarConcluida, isLoading, isInitialized } = useAtividadesStore();
  
  const [novaAtividade, setNovaAtividade] = useState<Omit<Atividade, 'id' | 'concluida'>>({
    nome: '',
    categoria: 'Criativa',
    duracao: 30,
    observacoes: '',
    data: new Date().toISOString().split('T')[0]
  });

  const [erro, setErro] = useState('');
  const [showForm, setShowForm] = useState(false);

  const categorias = [
    { value: 'Criativa', label: 'Criativa' }, { value: 'Física', label: 'Física' },
    { value: 'Social', label: 'Social' }, { value: 'Relaxante', label: 'Relaxante' },
    { value: 'Intelectual', label: 'Intelectual' }, { value: 'Outra', label: 'Outra' }
  ];

  const estatisticas = useMemo(() => {
    const atividadesConcluidas = atividades.filter(a => a.concluida).length;
    const totalMinutosLazer = atividades.filter(a => a.concluida).reduce((acc, curr) => acc + curr.duracao, 0);
    const contagem = atividades.filter(a => a.concluida).reduce((acc, curr) => {
      acc[curr.categoria] = (acc[curr.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const categoriaMaisComum = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    return { atividadesConcluidas, totalMinutosLazer, categoriaMaisComum };
  }, [atividades]);

  const handleAdicionarAtividade = async () => {
    if (!novaAtividade.nome.trim()) {
      setErro('O nome da atividade é obrigatório');
      return;
    }
    await adicionarAtividade(novaAtividade);
    setNovaAtividade({ nome: '', categoria: 'Criativa', duracao: 30, observacoes: '', data: new Date().toISOString().split('T')[0] });
    setErro('');
    setShowForm(false);
  };

  if (isLoading && !isInitialized) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-lazer-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : 'Nova Atividade'}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Atividades Realizadas" value={estatisticas.atividadesConcluidas.toString()} icon={<Bookmark className="h-5 w-5" />} />
        <StatCard title="Tempo de Lazer" value={`${Math.floor(estatisticas.totalMinutosLazer / 60)}h ${estatisticas.totalMinutosLazer % 60}m`} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Categoria Favorita" value={estatisticas.categoriaMaisComum} icon={<Bookmark className="h-5 w-5" />} />
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Nova Atividade de Lazer</h3>
          {erro && <Alert variant="error" className="mb-3">{erro}</Alert>}
          <div className="space-y-4">
            <Input label="Nome da atividade" value={novaAtividade.nome} onChange={e => setNovaAtividade({...novaAtividade, nome: e.target.value})} placeholder="Ex: Ler um livro" required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Categoria" value={novaAtividade.categoria} onChange={e => setNovaAtividade({...novaAtividade, categoria: e.target.value})} options={categorias} />
              <Input label="Duração (minutos)" type="number" min="5" max="240" value={novaAtividade.duracao} onChange={e => setNovaAtividade({...novaAtividade, duracao: parseInt(e.target.value) || 30})} />
            </div>
            <Input label="Data" type="date" value={novaAtividade.data} onChange={e => setNovaAtividade({...novaAtividade, data: e.target.value})} />
            <Textarea label="Observações (opcional)" value={novaAtividade.observacoes} onChange={e => setNovaAtividade({...novaAtividade, observacoes: e.target.value})} />
            <Button onClick={handleAdicionarAtividade} className="w-full">Adicionar Atividade</Button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium mb-3">Suas Atividades</h3>
        {atividades.length === 0 ? (
          <div className="text-center py-8 text-gray-500"><Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>Nenhuma atividade de lazer registrada.</p></div>
        ) : (
          <div className="space-y-3">
            {atividades.map(atividade => (
              <div key={atividade.id} className={`p-4 rounded-lg border ${atividade.concluida ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h4 className={`font-medium ${atividade.concluida ? 'text-gray-500' : ''}`}>{atividade.nome}</h4>
                      <Badge className="ml-2" variant={atividade.concluida ? "secondary" : "default"}>{atividade.categoria}</Badge>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-3">
                      <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{atividade.duracao} min</span>
                      <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(atividade.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                    {atividade.observacoes && <p className="mt-2 text-sm">{atividade.observacoes}</p>}
                  </div>
                  <div className="flex space-x-2">
                    {!atividade.concluida && <Button variant="outline" size="sm" onClick={() => marcarConcluida(atividade.id)}>Concluir</Button>}
                    <Button variant="destructive" size="sm" onClick={() => removerAtividade(atividade.id)}><Trash className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}