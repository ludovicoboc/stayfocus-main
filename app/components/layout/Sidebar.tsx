'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Utensils, Book, BookOpen, Heart, Smile, DollarSign, Rocket, X } from 'lucide-react'
import { NavItem } from '@/app/types'

const navItems: NavItem[] = [
  {
    name: 'Início',
    href: '/',
    icon: Home,
    color: 'text-inicio-primary',
    activeColor: 'bg-inicio-light',
  },
  {
    name: 'Alimentação',
    href: '/alimentacao',
    icon: Utensils,
    color: 'text-alimentacao-primary',
    activeColor: 'bg-alimentacao-light',
  },
  {
    name: 'Receitas',
    href: '/receitas',
    icon: Book,
    color: 'text-blue-600',
    activeColor: 'bg-blue-100',
  },
  {
    name: 'Estudos',
    href: '/estudos',
    icon: BookOpen,
    color: 'text-estudos-primary',
    activeColor: 'bg-estudos-light',
  },
  {
    name: 'Saúde',
    href: '/saude',
    icon: Heart,
    color: 'text-saude-primary',
    activeColor: 'bg-saude-light',
  },
  {
    name: 'Lazer',
    href: '/lazer',
    icon: Smile,
    color: 'text-lazer-primary',
    activeColor: 'bg-lazer-light',
  },
  {
    name: 'Finanças',
    href: '/financas',
    icon: DollarSign,
    color: 'text-financas-primary',
    activeColor: 'bg-financas-light',
  },
  {
    name: 'Hiperfocos',
    href: '/hiperfocos',
    icon: Rocket,
    color: 'text-hiperfocos-primary',
    activeColor: 'bg-hiperfocos-light',
  },
]

type SidebarProps = {
  onClose: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname() ?? '';

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex" 
      role="dialog" 
      aria-modal="true" 
      aria-label="Menu principal"
      onKeyDown={handleKeyDown}
    >
      {/* Overlay escuro com acessibilidade melhorada */}
      <div 
        className="fixed inset-0 bg-gray-900/60" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar com estrutura semântica melhorada */}
      <div 
        className="relative flex-1 flex flex-col w-64 max-w-xs bg-white dark:bg-gray-800 shadow-xl"
        tabIndex={-1}
        role="document"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white" id="sidebar-title">Menu</h2>
          <button
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
            aria-label="Fechar menu"
            tabIndex={0}
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Fechar</span>
          </button>
        </div>
        
        <nav 
          className="flex-1 p-4 overflow-y-auto"
          aria-labelledby="sidebar-title"
        >
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors
                    ${isActive 
                      ? `${item.activeColor} ${item.color}` 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}
                  `}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                  tabIndex={0}
                >
                  <item.icon 
                    className={`mr-3 h-5 w-5 ${item.iconClasses || ''}`} 
                    aria-hidden="true" 
                  />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
