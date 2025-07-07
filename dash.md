// app/page.tsx

import { FC, Suspense } from 'react';
import { PainelDia } from '@/components/PainelDia';
import { ListaPrioridades } from '@/components/ListaPrioridades';
import { ChecklistMedicamentos } from '@/components/ChecklistMedicamentos';
import { LembretePausas } from '@/components/LembretePausas';
import { CardProximaProva } from '@/components/CardProximaProva';
import { ModeToggle } from '@/components/ModeToggle';

const DashboardPage: FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-3 shadow-md">
        <h1 className="text-xl font-bold">StayFocus</h1>
        <ModeToggle />
      </header>

      <div className="flex flex-col lg:flex-row">
        <aside className="lg:w-64 w-full lg:h-screen border-r px-4 py-6 space-y-4">
          <nav className="space-y-2">
            <a href="#" className="block font-medium hover:underline">Painel do Dia</a>
            <a href="#" className="block font-medium hover:underline">Prioridades</a>
            <a href="#" className="block font-medium hover:underline">Medicamentos</a>
            <a href="#" className="block font-medium hover:underline">Pausas</a>
            <a href="#" className="block font-medium hover:underline">Concursos</a>
          </nav>
        </aside>

        <main className="flex-1 px-4 py-6 space-y-6">
          <Suspense fallback={<div>Carregando painel...</div>}>
            <PainelDia />
            <ListaPrioridades />
            <ChecklistMedicamentos />
            <LembretePausas />
            <CardProximaProva />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
