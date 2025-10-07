'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Ocorreu um erro</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Não foi possível processar sua solicitação. O link pode ter expirado ou ser inválido.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  )
}