import { Metadata } from 'next'
import { GuestOnly } from '@/app/lib/auth'
import { RegisterForm } from '@/app/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Criar Conta - StayFocus',
  description: 'Crie sua conta StayFocus para começar a gerenciar seus hiperfocos e tarefas.',
  robots: 'noindex, nofollow',
}

export default function RegisterPage() {
  return (
    <GuestOnly>
      <div 
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
        data-testid="register-page-container"
      >
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              StayFocus
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie seus hiperfocos com foco e produtividade
            </p>
          </div>
          
          <main role="main">
            <RegisterForm />
          </main>
        </div>
      </div>
    </GuestOnly>
  )
}
