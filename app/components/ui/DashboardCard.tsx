'use client'

import { DashboardCardProps } from '@/app/types'
import { cn } from '@/app/lib/utils'

export function DashboardCard({ children, title, className, isLoading = false }: DashboardCardProps) {
  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden",
        isLoading && "animate-pulse",
        className
      )}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          ) : (
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
          )}
        </div>
      )}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
} 