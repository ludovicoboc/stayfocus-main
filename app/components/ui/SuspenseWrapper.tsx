'use client'

import { Suspense } from 'react'
import { SuspenseWrapperProps } from '@/app/types'

export function SuspenseWrapper({ children, fallback }: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
} 