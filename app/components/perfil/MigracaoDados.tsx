'use client'

import { useState } from 'react'
import { migrarTodosDados } from '../../lib/migracao/migrarDadosParaDb'

export function MigracaoDados() {
  const [email, setEmail] = useState('')
  const [migrando, setMigrando] = useState(false)
  const [resultado, setResultado] = useState<{
    sucesso?: boolean
    mensagem?: string
    detalhes?: any
    erro?: any
  } | null>(null)
  
  // Gera um ID de usuário baseado no email
  const gerarUsuarioId = (email: string) => {
    // Em produção, você usaria o ID do usuário autenticado do Supabase
    // Esta é apenas uma implementação simples para demonstração
    return `user_${email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`
  }
  
  const handleMigrar = async () => {
    if (!email || !email.includes('@')) {
      alert('Por favor, insira um email válido')
      return
    }
    
    setMigrando(true)
    setResultado(null)
    
    try {
      const usuarioId = gerarUsuarioId(email)
      const resultado = await migrarTodosDados(usuarioId, email)
      setResultado(resultado)
    } catch (erro: any) {
      setResultado({
        sucesso: false,
        mensagem: 'Erro ao migrar dados',
        erro: erro.message || String(erro)
      })
    } finally {
      setMigrando(false)
    }
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Migração de Dados para o Banco de Dados
      </h2>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Esta ferramenta migrará seus dados armazenados localmente para o banco de dados Supabase.
        Isso permitirá que você acesse seus dados em diferentes dispositivos e evite perder informações
        ao limpar o cache do navegador.
      </p>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Seu Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="seu.email@exemplo.com"
          required
          disabled={migrando}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Este email será usado para identificar seus dados no banco de dados.
        </p>
      </div>
      
      <button
        onClick={handleMigrar}
        disabled={migrando || !email}
        className={`px-4 py-2 rounded-md text-white font-medium ${
          migrando || !email
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {migrando ? (
          <>
            <span className="inline-block animate-spin mr-2">⟳</span>
            Migrando Dados...
          </>
        ) : (
          'Iniciar Migração'
        )}
      </button>
      
      {resultado && (
        <div className={`mt-6 p-4 rounded-md ${
          resultado.sucesso
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <h3 className={`font-medium ${
            resultado.sucesso
              ? 'text-green-800 dark:text-green-400'
              : 'text-red-800 dark:text-red-400'
          }`}>
            {resultado.sucesso ? 'Migração Concluída' : 'Erro na Migração'}
          </h3>
          
          <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
            {resultado.mensagem}
          </p>
          
          {resultado.sucesso && resultado.detalhes && (
            <div className="mt-3 text-sm">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Detalhes:</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                <li>Perfil: {resultado.detalhes.perfil.mensagem}</li>
                <li>Sono: {resultado.detalhes.sono.mensagem}</li>
                <li>Alimentação: {resultado.detalhes.alimentacao.mensagem}</li>
                <li>Receitas: {resultado.detalhes.receitas.mensagem}</li>
              </ul>
            </div>
          )}
          
          {!resultado.sucesso && resultado.erro && (
            <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs font-mono text-red-800 dark:text-red-300 overflow-auto">
              {typeof resultado.erro === 'object' 
                ? JSON.stringify(resultado.erro, null, 2)
                : resultado.erro}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Importante:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>A migração não apaga seus dados locais.</li>
          <li>Se você já tiver dados no banco de dados, eles serão preservados.</li>
          <li>Apenas dados não existentes no banco serão adicionados.</li>
          <li>Este processo pode levar alguns minutos dependendo da quantidade de dados.</li>
        </ul>
      </div>
    </div>
  )
}