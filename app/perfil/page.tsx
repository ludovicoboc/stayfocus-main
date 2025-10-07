'use client'

import { useEffect } from 'react'
import { usePerfilStore } from '../stores/perfilStore'
import { InformacoesPessoais } from '../components/perfil/InformacoesPessoais'
import { MetasDiarias } from '../components/perfil/MetasDiarias'
import { PreferenciasVisuais } from '../components/perfil/PreferenciasVisuais'
import { User } from 'lucide-react'

export default function PerfilPage() {
  const { preferenciasVisuais } = usePerfilStore()
  
  // Aplicar classes de acessibilidade ao carregar a página
  useEffect(() => {
    if (preferenciasVisuais.altoContraste) {
      document.documentElement.classList.add('alto-contraste')
    }
    
    if (preferenciasVisuais.reducaoEstimulos) {
      document.documentElement.classList.add('reducao-estimulos')
    }
    
    if (preferenciasVisuais.textoGrande) {
      document.documentElement.classList.add('texto-grande')
    }
    
    // Cleanup
    return () => {
      document.documentElement.classList.remove('alto-contraste', 'reducao-estimulos', 'texto-grande')
    }
  }, [preferenciasVisuais])
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-perfil-primary flex items-center justify-center text-white text-xl font-bold mr-4">
            <User className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Informações Pessoais
          </h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InformacoesPessoais />
          <MetasDiarias />
        </div>
        
        <div className="space-y-6">
          <PreferenciasVisuais />
        </div>
      </div>
    </div>
  )
}
