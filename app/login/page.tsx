import { login } from './actions'
import Link from 'next/link'
import { Mail, Lock, LogIn } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Acessar sua conta</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Bem-vindo de volta!
          </p>
        </div>

        <form action={login} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              E-mail
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full py-2 pl-10 pr-4 text-gray-900 bg-gray-100 border-transparent rounded-md focus:border-blue-500 focus:bg-white focus:ring-0 dark:bg-gray-700 dark:text-white"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Senha
            </label>
            <div className="relative mt-1">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full py-2 pl-10 pr-4 text-gray-900 bg-gray-100 border-transparent rounded-md focus:border-blue-500 focus:bg-white focus:ring-0 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {searchParams.message && <p className="text-sm text-red-500">{searchParams.message}</p>}

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Entrar
          </button>
        </form>

        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          <p>
            Não tem uma conta?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
              Registre-se
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/recuperar-senha" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
              Esqueceu sua senha?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}