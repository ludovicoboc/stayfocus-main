'use client'

import { useState, useMemo } from 'react';
import { useSonoStore } from '../../stores/sonoStore';
import { 
  startOfWeek, endOfWeek, eachDayOfInterval, 
  format, parseISO, isSameDay, isWithinInterval,
  differenceInMinutes, addDays, subWeeks
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, ArrowRight, Moon, Sun, Clock, Loader2 } from 'lucide-react';

export function VisualizadorSemanal() {
  const { registros, isLoading, isInitialized } = useSonoStore();
  const [semanaAtual, setSemanaAtual] = useState(new Date());
  
  const irParaSemanaAnterior = () => setSemanaAtual(prev => subWeeks(prev, 1));
  const irParaProximaSemana = () => setSemanaAtual(prev => addDays(prev, 7));
  
  const intervaloSemana = useMemo(() => {
    const inicio = startOfWeek(semanaAtual, { weekStartsOn: 0 });
    const fim = endOfWeek(semanaAtual, { weekStartsOn: 0 });
    return { inicio, fim, diasDaSemana: eachDayOfInterval({ start: inicio, end: fim }) };
  }, [semanaAtual]);
  
  const diasFormatados = useMemo(() => {
    return intervaloSemana.diasDaSemana.map(dia => ({
      data: dia,
      diaSemana: format(dia, 'EEE', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase()),
      diaMes: format(dia, 'dd/MM')
    }));
  }, [intervaloSemana]);
  
  const dadosSemanal = useMemo(() => {
    return diasFormatados.map(dia => {
      const registrosDoDia = registros.filter(r => isSameDay(parseISO(r.inicio), dia.data) || (r.fim && isSameDay(parseISO(r.fim), dia.data)));
      let minutosTotais = 0;
      registrosDoDia.forEach(r => {
        if(r.fim) {
            const inicioIntervalo = parseISO(r.inicio) > dia.data ? parseISO(r.inicio) : dia.data;
            const fimIntervalo = parseISO(r.fim) < endOfWeek(dia.data) ? parseISO(r.fim) : endOfWeek(dia.data);
            if(fimIntervalo > inicioIntervalo) minutosTotais += differenceInMinutes(fimIntervalo, inicioIntervalo);
        }
      });
      const horasDeSono = Math.round(minutosTotais / 6) / 10;
      const registrosComQualidade = registrosDoDia.filter(r => r.qualidade !== null);
      const qualidadeMedia = registrosComQualidade.length > 0 ? registrosComQualidade.reduce((sum, r) => sum + (r.qualidade || 0), 0) / registrosComQualidade.length : null;
      
      return { ...dia, horasDeSono, qualidadeMedia, registros: registrosDoDia };
    });
  }, [diasFormatados, registros]);

  const calcularAlturaBarra = (horas: number) => `${Math.min((horas / 12) * 100, 100)}%`;
  const calcularCorBarra = (horas: number) => {
    if (horas >= 7 && horas <= 9) return 'bg-green-500';
    if (horas >= 5 || horas > 9) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading && !isInitialized) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-sono-primary" /></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Visualizador Semanal</h2>
      <div className="flex items-center justify-between mb-6">
        <button onClick={irParaSemanaAnterior} className="p-2 rounded-full"><ArrowLeft className="h-5 w-5" /></button>
        <div className="text-center">
          <h3 className="font-medium">{format(intervaloSemana.inicio, "dd MMM", { locale: ptBR })} - {format(intervaloSemana.fim, "dd MMM yyyy", { locale: ptBR })}</h3>
        </div>
        <button onClick={irParaProximaSemana} className="p-2 rounded-full"><ArrowRight className="h-5 w-5" /></button>
      </div>
      
      <div className="mb-8">
        <div className="flex items-end justify-between h-64 bg-gray-50 p-4 rounded-lg">
          {dadosSemanal.map((dia, index) => (
            <div key={index} className="flex flex-col items-center w-1/7">
              <div className="relative h-48 w-full flex items-end justify-center mb-2">
                {dia.horasDeSono > 0 ? (
                  <div className={`w-8 rounded-t-lg ${calcularCorBarra(dia.horasDeSono)}`} style={{ height: calcularAlturaBarra(dia.horasDeSono) }} title={`${dia.horasDeSono}h`} />
                ) : <div className="text-gray-400">—</div>}
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{dia.diaSemana}</div>
                <div className="text-xs text-gray-500">{dia.diaMes}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}