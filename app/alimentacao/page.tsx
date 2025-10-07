'use client'

import { useEffect } from 'react'
import { Card } from '@/app/components/ui/Card'
import { PlanejadorRefeicoes } from '@/app/components/alimentacao/PlanejadorRefeicoes'
import { RegistroRefeicoes } from '@/app/components/alimentacao/RegistroRefeicoes'
import { LembreteHidratacao } from '@/app/components/alimentacao/LembreteHidratacao'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore'
import { Loader2, AlertTriangle } from 'lucide-react'

export default function AlimentacaoPage() {
  const { fetchAlimentacaoData, loading, error } = useAlimentacaoStore()

  useEffect(() => {
    fetchAlimentacaoData()
  }, [fetchAlimentacaoData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600 dark:text-gray-400">Carregando dados de alimentação...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>Erro ao carregar os dados de alimentação.</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alimentação</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Planejador de Refeições">
          <PlanejadorRefeicoes />
        </Card>
        
        <Card title="Registro de Refeições">
          <RegistroRefeicoes />
        </Card>
      </div>
      
      <Card title="Hidratação">
        <LembreteHidratacao />
      </Card>

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
