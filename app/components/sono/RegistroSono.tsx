'use client'

import { useState } from 'react';
import { useSonoStore, RegistroSono } from '../../stores/sonoStore';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Moon, Trash2, Star, Edit2, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

export function RegistroSono() {
  const { registros, adicionarRegistroSono, atualizarRegistroSono, removerRegistroSono, isLoading, isInitialized } = useSonoStore();
  
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [notas, setNotas] = useState('');
  const [qualidade, setQualidade] = useState<number | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEdicao, setIdEdicao] = useState<number | null>(null);
  
  const formatarData = (dataISO: string) => {
    const data = parseISO(dataISO);
    if (isToday(data)) return `Hoje às ${format(data, 'HH:mm')}`;
    if (isYesterday(data)) return `Ontem às ${format(data, 'HH:mm')}`;
    return format(data, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };
  
  const calcularDuracao = (inicio: string, fim: string | null) => {
    if (!fim) return null;
    const diff = parseISO(fim).getTime() - parseISO(inicio).getTime();
    const horas = Math.floor(diff / 3600000);
    const minutos = Math.floor((diff % 3600000) / 60000);
    return `${horas}h ${minutos}min`;
  };
  
  const renderEstrelas = (q: number | null) => {
    if (q === null) return null;
    return Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < q ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />);
  };
  
  const resetForm = () => {
    setDataInicio(''); setHoraInicio(''); setDataFim(''); setHoraFim('');
    setNotas(''); setQualidade(null); setModoEdicao(false); setIdEdicao(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataInicio || !horaInicio) return;
    
    const inicioISO = new Date(`${dataInicio}T${horaInicio}`).toISOString();
    const fimISO = dataFim && horaFim ? new Date(`${dataFim}T${horaFim}`).toISOString() : null;
    
    const dados = { inicio: inicioISO, fim: fimISO, qualidade, notas };

    if (modoEdicao && idEdicao) {
      await atualizarRegistroSono(idEdicao, dados);
    } else {
      await adicionarRegistroSono(dados);
    }
    resetForm();
  };
  
  const iniciarEdicao = (registro: RegistroSono) => {
    const dataInicioObj = parseISO(registro.inicio);
    setDataInicio(format(dataInicioObj, 'yyyy-MM-dd'));
    setHoraInicio(format(dataInicioObj, 'HH:mm'));
    
    if (registro.fim) {
      const dataFimObj = parseISO(registro.fim);
      setDataFim(format(dataFimObj, 'yyyy-MM-dd'));
      setHoraFim(format(dataFimObj, 'HH:mm'));
    } else {
      setDataFim(''); setHoraFim('');
    }
    
    setNotas(registro.notas || '');
    setQualidade(registro.qualidade);
    setModoEdicao(true);
    setIdEdicao(registro.id);
  };
  
  const registrarAcordarAgora = async (id: number) => {
    await atualizarRegistroSono(id, { fim: new Date().toISOString() });
  };

  if (isLoading && !isInitialized) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-sono-primary" /></div>;
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Registro de Sono</h2>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium flex items-center mb-3"><Moon className="h-4 w-4 mr-2" />Horário de dormir</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required className="w-full p-2 border rounded" />
              <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required className="w-full p-2 border rounded" />
            </div>
            <button type="button" onClick={() => { const now = new Date(); setDataInicio(format(now, 'yyyy-MM-dd')); setHoraInicio(format(now, 'HH:mm')); }} className="mt-2 text-sm text-sono-primary">Registrar agora</button>
          </div>
          <div>
            <h3 className="font-medium flex items-center mb-3"><Clock className="h-4 w-4 mr-2" />Horário de acordar</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full p-2 border rounded" />
              <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className="w-full p-2 border rounded" />
            </div>
          </div>
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-2">Qualidade do sono</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((valor) => <button key={valor} type="button" onClick={() => setQualidade(valor)} className="p-2 rounded-full"><Star className={`h-6 w-6 ${qualidade && valor <= qualidade ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} /></button>)}
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="notas" className="block font-medium mb-2">Notas</label>
          <textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className="w-full p-2 border rounded" />
        </div>
        <div className="flex space-x-3">
          <Button type="submit">{modoEdicao ? 'Atualizar' : 'Registrar'}</Button>
          {modoEdicao && <Button type="button" onClick={resetForm} variant="outline">Cancelar</Button>}
        </div>
      </form>
      
      <div>
        <h3 className="font-medium mb-3">Registros Recentes</h3>
        <div className="space-y-4">
          {registros.length === 0 ? <p>Nenhum registro de sono encontrado.</p> : registros.slice(0, 5).map((registro) => (
            <div key={registro.id} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{formatarData(registro.inicio)}</div>
                  {registro.fim ? <div className="text-sm">Até {formatarData(registro.fim)}</div> : <div className="text-sm text-sono-primary">Ainda dormindo</div>}
                  {registro.fim && <div className="flex items-center mt-1"><Clock className="h-4 w-4 mr-1" /><span>{calcularDuracao(registro.inicio, registro.fim)}</span></div>}
                  {registro.qualidade !== null && <div className="flex mt-1">{renderEstrelas(registro.qualidade)}</div>}
                  {registro.notas && <p className="mt-2 text-sm">"{registro.notas}"</p>}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => iniciarEdicao(registro)} className="p-1"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => removerRegistroSono(registro.id)} className="p-1"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {!registro.fim && <button onClick={() => registrarAcordarAgora(registro.id)} className="mt-2 text-sm text-sono-primary">Registrar acordar agora</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}