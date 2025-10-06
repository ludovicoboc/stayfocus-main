'use client';

import React, { useState } from 'react';
import { Award, Calendar, Plus, Upload, Loader2 } from 'lucide-react';
import { useConcursosStore, Concurso } from '@/app/stores/concursosStore';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ConcursoForm } from '@/app/components/concursos/ConcursoForm';
import Link from 'next/link';
import { ImportarConcursoJsonModal } from '@/app/components/concursos/ImportarConcursoJsonModal';
import { useRouter } from 'next/navigation';

const statusLabel: Record<Concurso['status'], string> = {
  planejado: 'Planejado',
  inscrito: 'Inscrito',
  estudando: 'Estudando',
  realizado: 'Realizado',
  aguardando_resultado: 'Aguardando Resultado'
};

const statusColors: Record<Concurso['status'], string> = {
  planejado: 'bg-gray-100 text-gray-800',
  inscrito: 'bg-blue-100 text-blue-800',
  estudando: 'bg-indigo-100 text-indigo-800',
  realizado: 'bg-green-100 text-green-800',
  aguardando_resultado: 'bg-yellow-100 text-yellow-800'
};

export default function ConcursosPage() {
  const { concursos, adicionarConcurso, isLoading, isInitialized } = useConcursosStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const router = useRouter();

  const handleImportConcurso = async (concursoData: Omit<Concurso, 'id'>) => {
    await adicionarConcurso(concursoData);
    // A store já foi atualizada, podemos navegar ou mostrar um feedback.
    // A navegação pode ser um pouco abrupta, um feedback seria melhor.
    // Mas por enquanto, vamos manter o comportamento de redirecionamento.
    const ultimoConcurso = concursos[concursos.length - 1]; // Supõe que o último adicionado é o novo
    if(ultimoConcurso) router.push(`/concursos/${ultimoConcurso.id}`);
  };

  if (isLoading && !isInitialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="text-indigo-600" size={24} />
          Concursos
        </h1>
        <div className="flex justify-end mb-4 gap-2">
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <Plus size={16} className="mr-2" />
            Adicionar Manualmente
          </Button>
          <Button onClick={() => setShowImportModal(true)} size="sm" variant="outline">
            <Upload size={16} className="mr-2" />
            Importar JSON do Edital
          </Button>
        </div>
      </div>

      {concursos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {concursos.map((concurso) => (
            <Card key={concurso.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{concurso.titulo}</h3>
                  <p className="text-gray-500 text-sm">{concurso.organizadora}</p>
                </div>
                <div className={`py-1 px-3 rounded-full text-sm font-medium ${statusColors[concurso.status]}`}>
                  {statusLabel[concurso.status]}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm">{format(new Date(concurso.dataProva), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>Progresso de estudos</span>
                  <span className="font-medium">
                    {Math.round((concurso.conteudoProgramatico?.reduce((acc, curr) => acc + curr.progresso, 0) || 0) / (concurso.conteudoProgramatico?.length || 1))}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.round((concurso.conteudoProgramatico?.reduce((acc, curr) => acc + curr.progresso, 0) || 0) / (concurso.conteudoProgramatico?.length || 1))}%` }}></div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link href={`/concursos/${concurso.id}`} passHref>
                  <Button variant="link" className="text-indigo-600">Ver detalhes</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-500">Você ainda não cadastrou nenhum concurso.</p>
        </div>
      )}

      <ConcursoForm isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <ImportarConcursoJsonModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImport={handleImportConcurso} />
    </div>
  );
}