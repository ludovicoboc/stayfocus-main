'use client'

import { useState } from 'react';
import { useSonoStore } from '../../stores/sonoStore';
import { Plus, Trash2, Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export function ConfiguracaoLembretes() {
  const { lembretes, adicionarLembrete, atualizarLembrete, removerLembrete, isLoading, isInitialized } = useSonoStore();
  
  const [novoLembrete, setNovoLembrete] = useState({
    tipo: 'dormir' as 'dormir' | 'acordar',
    horario: '22:00',
    diasSemana: [] as number[],
  });
  const [showForm, setShowForm] = useState(false);

  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const handleToggleDia = (diaIndex: number) => {
    const diasAtuais = novoLembrete.diasSemana;
    if (diasAtuais.includes(diaIndex)) {
      setNovoLembrete({ ...novoLembrete, diasSemana: diasAtuais.filter(d => d !== diaIndex).sort() });
    } else {
      setNovoLembrete({ ...novoLembrete, diasSemana: [...diasAtuais, diaIndex].sort() });
    }
  };

  const handleAdicionarLembrete = async () => {
    if (!novoLembrete.horario || novoLembrete.diasSemana.length === 0) {
      alert('Por favor, defina um horário e selecione pelo menos um dia.');
      return;
    }
    await adicionarLembrete(novoLembrete);
    setShowForm(false);
    setNovoLembrete({ tipo: 'dormir', horario: '22:00', diasSemana: [] });
  };
  
  const handleToggleAtivo = async (id: number, ativo: boolean) => {
    await atualizarLembrete(id, { ativo: !ativo });
  };

  if (isLoading && !isInitialized) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-sono-primary" /></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Lembretes de Sono</h2>
      <div className="space-y-4 mb-6">
        {lembretes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum lembrete configurado.</p>
        ) : (
          lembretes.map(lembrete => (
            <div key={lembrete.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{lembrete.tipo === 'dormir' ? 'Lembrete para dormir' : 'Lembrete para acordar'}</p>
                <p className="text-2xl font-bold">{lembrete.horario}</p>
                <div className="flex gap-1 mt-1">
                  {dias.map((dia, index) => (
                    <span key={index} className={`text-xs px-2 py-0.5 rounded-full ${lembrete.diasSemana.includes(index) ? 'bg-sono-primary text-white' : 'bg-gray-200'}`}>{dia}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggleAtivo(lembrete.id, lembrete.ativo)} className="p-2">
                  {lembrete.ativo ? <Bell /> : <BellOff className="text-gray-400" />}
                </button>
                <Button variant="destructive" size="icon" onClick={() => removerLembrete(lembrete.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm ? (
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-medium">Novo Lembrete</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipo" value={novoLembrete.tipo} onChange={(e: any) => setNovoLembrete({...novoLembrete, tipo: e.target.value})} options={[{value: 'dormir', label: 'Dormir'}, {value: 'acordar', label: 'Acordar'}]} />
            <Input label="Horário" type="time" value={novoLembrete.horario} onChange={(e: any) => setNovoLembrete({...novoLembrete, horario: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Dias da Semana</label>
            <div className="flex gap-2 flex-wrap">
              {dias.map((dia, index) => (
                <button key={index} onClick={() => handleToggleDia(index)} className={`px-3 py-1 text-sm rounded-full ${novoLembrete.diasSemana.includes(index) ? 'bg-sono-primary text-white' : 'bg-gray-200'}`}>{dia}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleAdicionarLembrete}>Salvar</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" />Adicionar Lembrete</Button>
      )}
    </div>
  );
}