import { Card } from '@/app/components/ui/Card'
import { PlanejadorRefeicoes } from '@/app/components/alimentacao/PlanejadorRefeicoes'
// Removed duplicate Card import
// Removed duplicate PlanejadorRefeicoes import
import { RegistroRefeicoes } from '@/app/components/alimentacao/RegistroRefeicoes'
import { LembreteHidratacao } from '@/app/components/alimentacao/LembreteHidratacao'
import Link from 'next/link'; // Import Link
import { Button } from '@/app/components/ui/Button'; // Import Button

export default function AlimentacaoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alimentação</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Planejador de Refeições */}
        <Card title="Planejador de Refeições">
          <PlanejadorRefeicoes />
        </Card>
        
        {/* Registro Visual de Refeições */}
        <Card title="Registro de Refeições">
          <RegistroRefeicoes />
        </Card>
      </div>
      
      {/* Lembretes de Hidratação */}
      <Card title="Hidratação">
        <LembreteHidratacao />
      </Card>

      {/* Card para a Seção de Receitas */}
      <Card title="Minhas Receitas">
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Organize e acesse suas receitas favoritas aqui. Crie listas de compras e planeje suas refeições.
        </p>
        <Link href="/receitas" passHref>
          <Button color="primary">
            Acessar Minhas Receitas
          </Button>
        </Link>
      </Card>
    </div>
  )
}
