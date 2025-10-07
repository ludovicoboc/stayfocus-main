'use client'

import { useRef, useEffect } from 'react'
import { usePerfilStore, PerfilState } from '@/app/stores/perfilStore'
import { type User } from '@supabase/supabase-js'

interface ProfileData extends Omit<PerfilState, 'user' | 'setPerfil' | 'atualizarNome' | 'atualizarPreferenciasVisuais' | 'atualizarMetasDiarias' | 'alternarNotificacoes' | 'alternarPausas'> {
  user: User | null;
}

function StoreInitializer({ profile }: { profile: ProfileData }) {
  const initialized = useRef(false)

  useEffect(() => {
    // Evita a reinicialização em hot-reloads do modo de desenvolvimento
    if (!initialized.current) {
      usePerfilStore.getState().setPerfil(profile)
      initialized.current = true
    }
  }, [profile])

  return null
}

export default StoreInitializer