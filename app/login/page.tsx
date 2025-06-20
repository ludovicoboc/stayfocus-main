import { Metadata } from 'next'
import { GuestOnly } from '@/app/lib/auth'
import { LoginForm } from '@/app/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login - StayFocus',
  description: 'Entre na sua conta StayFocus para gerenciar seus hiperfocos e tarefas.',
  robots: 'noindex, nofollow',
}

export default function LoginPage() {
  return (
    <GuestOnly>
      <div 
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
        data-testid="login-page-container"
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
            <LoginForm />
          </main>
        </div>
      </div>
    </GuestOnly>
  )
}
