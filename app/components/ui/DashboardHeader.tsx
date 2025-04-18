'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/app/lib/utils'

type BreadcrumbItem = {
  label: string
  href: string
  active?: boolean
}

type DashboardHeaderProps = {
  title: string
  description?: string
  userName?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  showGreeting?: boolean
  className?: string
}

export function DashboardHeader({
  title,
  description,
  userName = 'Usuário',
  breadcrumbs,
  actions,
  showGreeting = true,
  className
}: DashboardHeaderProps) {
  const pathname = usePathname()
  
  // Obter a hora do dia para personalizar a saudação
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <header className={cn("mb-6", className)}>
      {/* Trilha de navegação (breadcrumbs) */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-2" aria-label="Trilha de navegação">
          <ol className="inline-flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link 
                href="/" 
                className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Home className="h-4 w-4 mr-1" />
                <span>Início</span>
              </Link>
            </li>
            
            {breadcrumbs.map((item, index) => (
              <li key={item.href} className="inline-flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" aria-hidden="true" />
                {index === breadcrumbs.length - 1 || item.active ? (
                  <span className="text-gray-800 dark:text-gray-200 font-medium" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Título e descrição */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
          
          {/* Saudação personalizada */}
          {showGreeting && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getGreeting()}, <span className="font-medium">{userName}</span>. {description}
            </p>
          )}
        </div>
        
        {/* Área para botões ou ações */}
        {actions && (
          <div className="mt-4 sm:mt-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
} 