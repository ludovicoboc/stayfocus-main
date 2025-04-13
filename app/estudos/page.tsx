'use client';
import Link from 'next/link'; // Importar Link para navegação
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button'; // Importar Button
import { TemporizadorPomodoro } from '@/app/components/estudos/TemporizadorPomodoro';
import { RegistroEstudos } from '@/app/components/estudos/RegistroEstudos';
import { useConcursosStore } from '@/app/stores/concursosStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EstudosPage() {
  const { concursos } = useConcursosStore();
  
  // Encontrar próximo concurso
  const proximoConcurso = concursos
    .filter(c => c.status !== 'realizado' && new Date(c.dataProva) > new Date())
    .sort((a, b) => new Date(a.dataProva).getTime() - new Date(b.dataProva).getTime())[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"> {/* Container para título e botão */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estudos</h1>
        <div className="flex gap-2">
          <Link href="/estudos/simulado" passHref>
            <Button variant="outline">Conferir Simulado</Button>
          </Link>
          <Link href="/concursos" passHref>
            <Button variant="default">Ver Todos Concursos</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temporizador Pomodoro Adaptado */}
        <Card title="Temporizador Pomodoro">
          <TemporizadorPomodoro />
        </Card>
        
        {/* Registro de Sessões de Estudo */}
        <Card title="Registro de Estudos">
          <RegistroEstudos />
        </Card>

        {/* Próximo Concurso */}
        <Card title="Próximo Concurso">
          {proximoConcurso ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{proximoConcurso.titulo}</h3>
                <p className="text-sm text-gray-500">{proximoConcurso.organizadora}</p>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Data da Prova:</span>
                <span>{format(new Date(proximoConcurso.dataProva), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>Progresso de estudos</span>
                  <span className="font-medium">
                    {Math.round(
                      (proximoConcurso.conteudoProgramatico?.reduce((acc, curr) => acc + curr.progresso, 0) || 0) / 
                      (proximoConcurso.conteudoProgramatico?.length || 1)
                    )}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.round(
                        (proximoConcurso.conteudoProgramatico?.reduce((acc, curr) => acc + curr.progresso, 0) || 0) / 
                        (proximoConcurso.conteudoProgramatico?.length || 1)
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href={`/concursos/${proximoConcurso.id}`} passHref>
                  <Button variant="link" className="text-indigo-600">
                    Ver detalhes
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhum concurso planejado</p>
              <Link href="/concursos" passHref>
                <Button variant="outline">Adicionar Concurso</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
