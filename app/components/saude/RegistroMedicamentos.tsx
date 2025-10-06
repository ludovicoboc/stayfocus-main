'use client'

import { useState, useCallback, useMemo } from 'react';
import { Pill, Plus, X, Edit, Trash, Check, Clock, Loader2 } from 'lucide-react';
import { useMedicamentosStore, Medicamento } from '@/app/stores/medicamentosStore'; // Mudar para a nova store
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { MedicamentosList } from './MedicamentosList';
import { StatCard } from './StatCard';

export function RegistroMedicamentos() {
  // Consumir a nova store dedicada
  const {
    medicamentos,
    adicionarMedicamento,
    atualizarMedicamento,
    removerMedicamento,
    registrarTomada,
    isLoading,
    isInitialized
  } = useMedicamentosStore();
  
  const [novoMedicamento, setNovoMedicamento] = useState({
    nome: '',
    dosagem: '',
    frequencia: 'Diária',
    horarios: ['08:00'],
    observacoes: '',
    dataInicio: new Date().toISOString().split('T')[0],
    intervalo: 240,
  });
  
  const [editandoId, setEditandoId] = useState<number | null>(null); // ID agora é numérico
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoHorario, setNovoHorario] = useState('08:00');
  const [erro, setErro] = useState('');

  const resetForm = useCallback(() => {
    setNovoMedicamento({
      nome: '', dosagem: '', frequencia: 'Diária', horarios: ['08:00'],
      observacoes: '', dataInicio: new Date().toISOString().split('T')[0], intervalo: 240,
    });
    setEditandoId(null);
    setMostrarForm(false);
    setNovoHorario('08:00');
    setErro('');
  }, []);

  const handleAdicionarMedicamento = async () => {
    if (!novoMedicamento.nome || novoMedicamento.horarios.length === 0) {
      setErro('Nome e pelo menos um horário são obrigatórios.');
      return;
    }
    await adicionarMedicamento(novoMedicamento);
    resetForm();
  };

  const iniciarEdicao = (medicamento: Medicamento) => {
    setEditandoId(medicamento.id);
    setNovoMedicamento({
      nome: medicamento.nome,
      dosagem: medicamento.dosagem,
      frequencia: medicamento.frequencia,
      horarios: [...medicamento.horarios],
      observacoes: medicamento.observacoes,
      dataInicio: medicamento.dataInicio,
      intervalo: medicamento.intervalo || 240,
    });
    setMostrarForm(true);
  };

  const salvarEdicao = async () => {
    if (!editandoId || !novoMedicamento.nome || novoMedicamento.horarios.length === 0) {
      setErro('Nome e pelo menos um horário são obrigatórios.');
      return;
    }
    await atualizarMedicamento(editandoId, novoMedicamento);
    resetForm();
  };

  const adicionarHorario = () => {
    if (!novoHorario || novoMedicamento.horarios.includes(novoHorario)) {
      setErro('Horário inválido ou já adicionado.');
      return;
    }
    setNovoMedicamento(prev => ({ ...prev, horarios: [...prev.horarios, novoHorario].sort() }));
    setNovoHorario('08:00');
    setErro('');
  };

  const removerHorario = (horario: string) => {
    setNovoMedicamento(prev => ({ ...prev, horarios: prev.horarios.filter((h) => h !== horario) }));
  };

  const handleRegistrarTomada = async (id: number) => {
    await registrarTomada(id, new Date().toISOString());
  };

  const estatisticas = useMemo(() => {
    const total = medicamentos.length;
    const tomadosHoje = medicamentos.filter(med =>
      med.ultimaTomada && med.ultimaTomada.split('T')[0] === new Date().toISOString().split('T')[0]
    ).length;
    const percentualTomados = total > 0 ? Math.round((tomadosHoje / total) * 100) : 0;
    return { total, tomadosHoje, percentualTomados };
  }, [medicamentos]);

  const proximaDose = useMemo(() => {
    if (medicamentos.length === 0) return { texto: "N/A", descricao: "Sem medicamentos" };
    const agora = new Date();
    let proximaDoseGlobal: Date | null = null;
    let proximoMedicamentoNome = '';

    medicamentos.forEach(med => {
      med.horarios.forEach(h => {
        const [hora, minuto] = h.split(':').map(Number);
        const dataHora = new Date(agora);
        dataHora.setHours(hora, minuto, 0, 0);
        if (dataHora < agora) dataHora.setDate(dataHora.getDate() + 1);

        if (!proximaDoseGlobal || dataHora < proximaDoseGlobal) {
          proximaDoseGlobal = dataHora;
          proximoMedicamentoNome = med.nome;
        }
      });
    });

    if (!proximaDoseGlobal) return { texto: "N/A", descricao: "Verifique horários" };

    const diffMs = proximaDoseGlobal.getTime() - agora.getTime();
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffMinutos = Math.floor((diffMs % 3600000) / 60000);
    const textoTempo = diffHoras > 0 ? `${diffHoras}h ${diffMinutos}m` : `${diffMinutos}m`;

    return { texto: textoTempo, descricao: proximoMedicamentoNome };
  }, [medicamentos]);

  const opcoesFrequencia = [
    { value: 'Diária', label: 'Diária' }, { value: 'Semanal', label: 'Semanal' },
    { value: 'Mensal', label: 'Mensal' }, { value: 'Conforme necessário', label: 'Conforme necessário' },
  ];
  const opcoesIntervalo = [
    { value: '60', label: '1 hora' }, { value: '120', label: '2 horas' }, { value: '180', label: '3 horas' },
    { value: '240', label: '4 horas' }, { value: '360', label: '6 horas' }, { value: '480', label: '8 horas' },
    { value: '720', label: '12 horas' }, { value: '1440', label: '24 horas' },
  ];

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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Registro de Medicamentos</h2>
          <Button onClick={() => { resetForm(); setMostrarForm(true); }} aria-label="Adicionar novo medicamento">
            <Plus className="h-4 w-4 mr-2" />Novo Medicamento
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total de Medicamentos" value={estatisticas.total} icon={<Pill className="h-5 w-5" />} />
          <StatCard title="Tomados Hoje" value={estatisticas.tomadosHoje} icon={<Check className="h-5 w-5" />} description={`${estatisticas.percentualTomados}% dos medicamentos`} />
          <StatCard title="Próxima Dose" value={proximaDose.texto} icon={<Clock className="h-5 w-5" />} description={proximaDose.descricao} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Seus Medicamentos</h3>
        <MedicamentosList medicamentos={medicamentos} onEdit={iniciarEdicao} onDelete={removerMedicamento} onRegistrarTomada={handleRegistrarTomada} />
      </Card>

      <Modal isOpen={mostrarForm} onClose={resetForm} title={editandoId ? "Editar Medicamento" : "Novo Medicamento"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={editandoId ? salvarEdicao : handleAdicionarMedicamento}>{editandoId ? "Salvar Alterações" : "Adicionar"}</Button>
          </div>
        }>
        {erro && <Alert variant="error" className="mb-4">{erro}</Alert>}
        <div className="space-y-4">
          <Input value={novoMedicamento.nome} onChange={(e) => setNovoMedicamento({ ...novoMedicamento, nome: e.target.value })} label="Nome do Medicamento" placeholder="Ex: Ritalina" required />
          <Input value={novoMedicamento.dosagem} onChange={(e) => setNovoMedicamento({ ...novoMedicamento, dosagem: e.target.value })} label="Dosagem" placeholder="Ex: 10mg" />
          <Select value={novoMedicamento.frequencia} onChange={(e) => setNovoMedicamento({ ...novoMedicamento, frequencia: e.target.value })} label="Frequência" options={opcoesFrequencia} />
          <Select value={novoMedicamento.intervalo?.toString() || '240'} onChange={(e) => setNovoMedicamento({ ...novoMedicamento, intervalo: parseInt(e.target.value) })} label="Intervalo entre doses" options={opcoesIntervalo} helpText="Tempo mínimo recomendado" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horários</label>
            <div className="flex gap-2 mb-2">
              <Input type="time" value={novoHorario} onChange={(e) => setNovoHorario(e.target.value)} className="flex-1" />
              <Button onClick={adicionarHorario} aria-label="Adicionar horário"><Plus className="h-4 w-4" /></Button>
            </div>
            {novoMedicamento.horarios.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {novoMedicamento.horarios.map((horario) => (
                  <Badge key={horario} variant="primary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3 mr-1" />{horario}
                    <button onClick={() => removerHorario(horario)} className="ml-1" aria-label={`Remover horário ${horario}`}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Input type="date" value={novoMedicamento.dataInicio} onChange={(e) => setNovoMedicamento({ ...novoMedicamento, dataInicio: e.target.value })} label="Data de Início" />
          <Textarea value={novoMedicamento.observacoes} onChange={(e) => setNovoMedicamento({ ...novoMedicamento, observacoes: e.target.value })} label="Observações" placeholder="Adicione informações importantes..." />
        </div>
      </Modal>
    </div>
  )
}