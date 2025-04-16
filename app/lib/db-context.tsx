'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { usuarioService } from './services/usuarioService'
import { alimentacaoService } from './services/alimentacaoService'
import { sonoService } from './services/sonoService'
import { receitasService } from './services/receitasService'

// Tipo para o contexto do banco de dados
type DbContextType = {
  usuario: typeof usuarioService
  alimentacao: typeof alimentacaoService
  sono: typeof sonoService
  receitas: typeof receitasService
}

// Criação do contexto
const DbContext = createContext<DbContextType | null>(null)

// Hook para usar o contexto
export const useDb = () => {
  const context = useContext(DbContext)
  if (!context) {
    throw new Error('useDb deve ser usado dentro de um DbProvider')
  }
  return context
}

// Props para o provedor
type DbProviderProps = {
  children: ReactNode
}

// Provedor do contexto
export const DbProvider = ({ children }: DbProviderProps) => {
  // Valor do contexto
  const value: DbContextType = {
    usuario: usuarioService,
    alimentacao: alimentacaoService,
    sono: sonoService,
    receitas: receitasService
  }

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>
}