'use client'

import { DashboardSectionProps } from '@/app/types'
import { cn } from '@/app/lib/utils'

export function DashboardSection({ id, title, children, className }: DashboardSectionProps) {
  const titleId = id || title?.toLowerCase().replace(/\s+/g, '-') || undefined
  
  return (
    <section 
      aria-labelledby={titleId}
      className={cn("mt-6", className)}
    >
      {title && (
        <h2 
          id={titleId} 
          className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  )
} 