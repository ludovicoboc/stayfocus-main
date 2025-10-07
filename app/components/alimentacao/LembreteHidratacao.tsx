'use client'

import { Droplet, PlusCircle, MinusCircle } from 'lucide-react'
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore'

export function LembreteHidratacao() {
  const { hidratacao, atualizarHidratacao } = useAlimentacaoStore()
  const { copos_bebidos, meta_diaria } = hidratacao

  const progresso = Math.min((copos_bebidos / meta_diaria) * 100, 100)

  const handleAtualizarHidratacao = (updates: Partial<{ copos_bebidos: number; meta_diaria: number }>) => {
    atualizarHidratacao(updates)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Acompanhamento de Hidratação
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Registre os copos de água que você bebe durante o dia
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAtualizarHidratacao({ meta_diaria: meta_diaria - 1 })}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Diminuir meta diária"
            disabled={meta_diaria <= 1}
          >
            <MinusCircle className="h-6 w-6" />
          </button>
          
          <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Meta: {meta_diaria} copos
            </span>
          </div>
          
          <button
            onClick={() => handleAtualizarHidratacao({ meta_diaria: meta_diaria + 1 })}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Aumentar meta diária"
            disabled={meta_diaria >= 15}
          >
            <PlusCircle className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progresso}%` }}
          role="progressbar"
          aria-valuenow={copos_bebidos}
          aria-valuemin={0}
          aria-valuemax={meta_diaria}
        ></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {copos_bebidos} de {meta_diaria} copos
        </div>
        
        <div className="text-blue-600 dark:text-blue-400">
          {progresso.toFixed(0)}%
        </div>
      </div>

      <div className="flex flex-wrap gap-2 my-4 justify-center">
        {Array.from({ length: meta_diaria }).map((_, index) => (
          <div
            key={index}
            className={`w-12 h-16 flex items-center justify-center rounded-b-lg border border-t-0 ${
              index < copos_bebidos
                ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-700'
            }`}
            aria-label={index < copos_bebidos ? 'Copo bebido' : 'Copo não bebido'}
          >
            <Droplet
              className={`h-8 w-8 ${
                index < copos_bebidos
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => handleAtualizarHidratacao({ copos_bebidos: copos_bebidos + 1 })}
          disabled={copos_bebidos >= meta_diaria}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Registrar um copo de água"
        >
          Registrar Copo
        </button>
        
        <button
          onClick={() => handleAtualizarHidratacao({ copos_bebidos: copos_bebidos - 1 })}
          disabled={copos_bebidos <= 0}
          className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remover um copo de água"
        >
          Remover Copo
        </button>
      </div>

      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
        <h4 className="font-medium mb-1">Dicas de Hidratação:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mantenha uma garrafa de água sempre visível</li>
          <li>Beba um copo ao acordar e antes de cada refeição</li>
          <li>Configure lembretes no celular a cada 1-2 horas</li>
        </ul>
      </div>
    </div>
  )
}
