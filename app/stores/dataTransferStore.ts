import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Tipos de estado para a transferência de dados
 */
export type TransferenciaStatus = 'idle' | 'exporting' | 'importing' | 'success' | 'error';

interface DataTransferState {
  // Estado
  status: TransferenciaStatus;
  mensagem: string;
  ultimaExportacao: string | null;
  ultimaImportacao: string | null;
  
  // Ações
  setStatus: (status: TransferenciaStatus) => void;
  setMensagem: (mensagem: string) => void;
  registrarExportacao: () => void;
  registrarImportacao: (timestamp?: string) => void;
  limparHistorico: () => void;
}

/**
 * Store para gerenciar o estado da transferência de dados
 */
export const useDataTransferStore = create<DataTransferState>()(
  persist(
    (set) => ({
      // Estado inicial
      status: 'idle',
      mensagem: '',
      ultimaExportacao: null,
      ultimaImportacao: null,
      
      // Ações
      setStatus: (status) => set({ status }),
      
      setMensagem: (mensagem) => set({ mensagem }),
      
      registrarExportacao: () => set({ 
        ultimaExportacao: new Date().toISOString(),
        status: 'success',
        mensagem: 'Dados exportados com sucesso'
      }),
      
      registrarImportacao: (timestamp) => set({ 
        ultimaImportacao: timestamp || new Date().toISOString(),
        status: 'success',
        mensagem: 'Dados importados com sucesso'
      }),
      
      limparHistorico: () => set({ 
        ultimaExportacao: null,
        ultimaImportacao: null
      }),
    }),
    {
      name: 'data-transfer-storage', // nome para o localStorage
    }
  )
); 