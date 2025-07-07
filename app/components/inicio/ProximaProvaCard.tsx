'use client';

import React from 'react';
import Link from 'next/link';
import { useConcursosStore, Concurso } from '@/app/stores/concursosStore';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { CalendarCheck, ArrowRight } from 'lucide-react';
import { format, differenceInDays, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para calcular e formatar a contagem regressiva
const formatCountdown = (dataProva: string): string => {
  const hoje = new Date();
  const provaDate = new Date(dataProva);
  const diasRestantes = differenceInDays(provaDate, hoje);

  if (diasRestantes < 0) {
    return 'Prova realizada';
  } else if (diasRestantes === 0) {
    return 'Prova é hoje!';
  } else if (diasRestantes === 1) {
    return 'Falta 1 dia';
  } else {
    return `Faltam ${diasRestantes} dias`;
  }
};

export function ProximaProvaCard() {
  const { concursos } = useConcursosStore();

  // Filtra concursos futuros e ordena pelos mais próximos
  const proximasProvas = concursos
    .filter(c => isFuture(new Date(c.dataProva)))
    .sort((a, b) => new Date(a.dataProva).getTime() - new Date(b.dataProva).getTime())
    .slice(0, 3); // Limita a 3 provas no card, por exemplo

  if (proximasProvas.length === 0) {
    // Pode retornar null ou uma mensagem indicando que não há provas futuras
    return null;
    // Ou:
    // return (
    //   <Card className="p-4 text-center text-gray-500">
    //     Nenhuma prova futura cadastrada.
    //   </Card>
    // );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <CalendarCheck size={20} className="text-indigo-600" />
        Próximas Provas
      </h3>
      <div className="space-y-3">
        {proximasProvas.map((prova) => (
          <div key={prova.id} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
            <div>
              <p className="font-medium">{prova.titulo}</p>
              <p className="text-sm text-gray-500">
                {format(new Date(prova.dataProva), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
            <div className="text-right">
               <p className="text-sm font-semibold text-indigo-600">{formatCountdown(prova.dataProva)}</p>
               <Link href={`/concursos/${prova.id}`} passHref>
                 <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                   Ver detalhes <ArrowRight size={12} className="ml-1" />
                 </Button>
               </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
