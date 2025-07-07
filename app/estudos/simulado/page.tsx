'use client'; // Necessário para usar hooks como useState e useEffect, e o store Zustand

import React, { useState } from 'react'; // Adicionar useState
import { useSimuladoStore } from '@/app/stores/simuladoStore';
// Padronizando a forma de importação para todos os componentes
import SimuladoLoader from '@/app/components/estudos/simulado/SimuladoLoader';
import SimuladoReview from '@/app/components/estudos/simulado/SimuladoReview';
import SimuladoResults from '@/app/components/estudos/simulado/SimuladoResults';
import HistoricoModal from '@/app/components/estudos/simulado/HistoricoModal'; // <-- Corrigir importação sem extensão
import { Container } from '@/app/components/ui/Container'; // Usando um container genérico existente
import { Button } from '@/app/components/ui/Button'; // Usando botão existente
import { History } from 'lucide-react'; // <-- Importar ícone de histórico

const SimuladoPage: React.FC = () => {
  const { status, resetSimulado } = useSimuladoStore();
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false); // <-- Estado para controlar o modal

  const renderContent = () => {
    switch (status) {
      case 'reviewing':
        return <SimuladoReview />;
      case 'results':
        return <SimuladoResults />;
      case 'loading': // Poderia ter um estado de loading visual
        return <div>Carregando simulado...</div>;
      case 'idle':
      default:
        return <SimuladoLoader />;
    }
  };

  return (
    <> {/* Usar Fragment para envolver Container e Modal */}
      <Container>
        <div className="flex justify-between items-center mb-6 gap-2"> {/* Adicionado gap */}
          <h1 className="text-2xl font-bold">Conferência de Simulado</h1>
          <div className="flex gap-2"> {/* Agrupar botões */}
            <Button onClick={() => setIsHistoricoOpen(true)} variant="outline" size="sm">
              <History className="mr-1 h-4 w-4" /> Histórico
            </Button>
            {status !== 'idle' && (
              <Button onClick={resetSimulado} variant="outline" size="sm">
                Carregar Novo
              </Button>
            )}
          </div>
        </div>
        {renderContent()}
      </Container>

      {/* Modal do Histórico */}
      <HistoricoModal
        isOpen={isHistoricoOpen}
        onClose={() => setIsHistoricoOpen(false)}
      />
    </>
  );
};

export default SimuladoPage;
