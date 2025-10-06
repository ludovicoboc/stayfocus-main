'use client'

import { useState, useCallback, useMemo } from 'react';
import { Calendar, Plus, X, Edit, Trash, Smile, Loader2 } from 'lucide-react';
import { useHumorStore, RegistroHumor } from '@/app/stores/humorStore'; // Mudar para a nova store
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { StatCard } from './StatCard';
import { HumorCalendar } from './HumorCalendar';
import { FatoresHumor } from './FatoresHumor';

export function MonitoramentoHumor() {
  const {
    registros: registrosHumor,
    adicionarRegistro,
    atualizarRegistro,
    removerRegistro,
    isLoading,
    isInitialized
  } = useHumorStore();
  
  const [novoRegistro, setNovoRegistro] = useState({
    data: new Date().toISOString().split('T')[0],
    nivel: 3,
    fatores: [] as string[],
    notas: '',
  });
  
  const [editandoId, setEditandoId] = useState<number | null>(null); // ID agora é numérico
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoFator, setNovoFator] = useState('');
  const [mesAtual, setMesAtual] = useState(() => new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(() => new Date().getFullYear());
  const [erro, setErro] = useState('');

  const resetForm = useCallback(() => {
    setNovoRegistro({ data: new Date().toISOString().split('T')[0], nivel: 3, fatores: [], notas: '' });
    setEditandoId(null);
    setMostrarForm(false);
    setNovoFator('');
    setErro('');
  }, []);

  const handleAdicionarRegistro = async () => {
    if (!novoRegistro.data) {
      setErro('A data é obrigatória');
      return;
    }
    await adicionarRegistro({ nivel: novoRegistro.nivel, fatores: novoRegistro.fatores, notas: novoRegistro.notas });
    resetForm();
  };

  const iniciarEdicao = useCallback((registro: RegistroHumor) => {
    setEditandoId(registro.id);
    setNovoRegistro({
      data: registro.data,
      nivel: registro.nivel,
      fatores: [...registro.fatores],
      notas: registro.notas,
    });
    setMostrarForm(true);
  }, []);

  const salvarEdicao = async () => {
    if (!editandoId || !novoRegistro.data) {
      setErro('A data é obrigatória');
      return;
    }
    await atualizarRegistro(editandoId, {
      nivel: novoRegistro.nivel,
      fatores: [...novoRegistro.fatores],
      notas: novoRegistro.notas,
    });
    resetForm();
  };

  const adicionarFator = useCallback(() => {
    if (!novoFator || novoRegistro.fatores.includes(novoFator)) {
      setErro('Fator inválido ou já adicionado.');
      return;
    }
    setNovoRegistro(prev => ({ ...prev, fatores: [...prev.fatores, novoFator] }));
    setNovoFator('');
    setErro('');
  }, [novoFator, novoRegistro.fatores]);

  const removerFator = useCallback((fator: string) => {
    setNovoRegistro(prev => ({ ...prev, fatores: prev.fatores.filter((f) => f !== fator) }));
  }, []);

  const registrosOrdenados = useMemo(() => [...registrosHumor].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()), [registrosHumor]);
  const humorMedio = useMemo(() => {
    if (registrosHumor.length === 0) return '0.0';
    const soma = registrosHumor.reduce((acc, registro) => acc + registro.nivel, 0);
    return (soma / registrosHumor.length).toFixed(1);
  }, [registrosHumor]);

  const handleSelecionarDia = useCallback((data: string) => {
    const registroExistente = registrosHumor.find(r => r.data === data);
    if (registroExistente) {
      iniciarEdicao(registroExistente);
    } else {
      resetForm();
      setNovoRegistro(prev => ({ ...prev, data }));
      setMostrarForm(true);
    }
  }, [registrosHumor, iniciarEdicao, resetForm]);

  if (isLoading && !isInitialized) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-saude-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Monitoramento de Humor</h2>
          <Button onClick={() => { resetForm(); setMostrarForm(true); }}><Plus className="h-4 w-4 mr-2" />Novo Registro</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Humor Médio" value={humorMedio} icon={<Smile className="h-5 w-5" />} description="Baseado nos registros" />
          <div className="md:col-span-2"><FatoresHumor registros={registrosHumor} /></div>
        </div>
        <div className="mb-6">
            <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
              <h3 className="text-lg font-medium">Calendário de Humor</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setMesAtual(m => m === 0 ? 11 : m - 1)}>&larr;</Button>
                <span>{new Date(anoAtual, mesAtual).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                <Button variant="outline" size="sm" onClick={() => setMesAtual(m => m === 11 ? 0 : m + 1)}>&rarr;</Button>
              </div>
            </div>
            <HumorCalendar registros={registrosHumor} mes={mesAtual} ano={anoAtual} onSelectDay={handleSelecionarDia} />
        </div>
        <h3 className="text-lg font-medium mb-3">Registros Recentes</h3>
        {registrosOrdenados.length === 0 ? (
          <Alert variant="info" title="Nenhum registro encontrado" />
        ) : (
          <div className="space-y-3">
            {registrosOrdenados.slice(0, 5).map((registro) => (
              <Card key={registro.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{new Date(registro.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    <p>Nível: {registro.nivel}</p>
                    {registro.fatores.length > 0 && <p>Fatores: {registro.fatores.join(', ')}</p>}
                    {registro.notas && <p>Notas: {registro.notas}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => iniciarEdicao(registro)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removerRegistro(registro.id)}><Trash className="h-4 w-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
      <Modal isOpen={mostrarForm} onClose={resetForm} title={editandoId ? "Editar Registro" : "Novo Registro"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={editandoId ? salvarEdicao : handleAdicionarRegistro}>{editandoId ? "Salvar" : "Adicionar"}</Button>
          </div>
        }>
        {erro && <Alert variant="error" className="mb-4">{erro}</Alert>}
        <div className="space-y-4">
          <Input type="date" value={novoRegistro.data} onChange={(e) => setNovoRegistro({ ...novoRegistro, data: e.target.value })} label="Data" required />
          <div>
            <label>Nível de Humor (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((nivel) => (
                <button key={nivel} type="button" onClick={() => setNovoRegistro({ ...novoRegistro, nivel })}
                  className={`w-10 h-10 rounded-full ${nivel === novoRegistro.nivel ? 'bg-saude-primary text-white' : 'bg-gray-200'}`}>{nivel}</button>
              ))}
            </div>
          </div>
          <div>
            <label>Fatores</label>
            <div className="flex gap-2 mb-2">
              <Input value={novoFator} onChange={(e) => setNovoFator(e.target.value)} placeholder="Adicionar fator..." />
              <Button onClick={adicionarFator} disabled={!novoFator}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {novoRegistro.fatores.map((fator) => (
                <Badge key={fator} variant="secondary">{fator}<button onClick={() => removerFator(fator)} className="ml-1"><X className="h-3 w-3" /></button></Badge>
              ))}
            </div>
          </div>
          <Textarea value={novoRegistro.notas} onChange={(e) => setNovoRegistro({ ...novoRegistro, notas: e.target.value })} label="Notas" />
        </div>
      </Modal>
    </div>
  );
}