import { create } from 'zustand';

// Tipos de dados (mantidos)
export type PreferenciasVisuais = {
  altoContraste: boolean;
  reducaoEstimulos: boolean;
  textoGrande: boolean;
};

export type MetasDiarias = {
  horasSono: number;
  tarefasPrioritarias: number;
  coposAgua: number;
  pausasProgramadas: number;
};

// Estrutura completa do perfil como recebido da API
export type PerfilCompleto = {
  nome: string;
  email: string;
  preferenciasVisuais: PreferenciasVisuais;
  metasDiarias: MetasDiarias;
  notificacoesAtivas: boolean;
  pausasAtivas: boolean;
};

// Estado da store
export type PerfilState = PerfilCompleto & {
  isInitialized: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<PerfilCompleto>) => Promise<void>;
  resetarPerfil: () => void; // Manter para logout ou reset local
};

const defaultState: Omit<PerfilState, 'initialize' | 'updateProfile' | 'resetarPerfil' | 'email'> = {
  nome: 'Usuário',
  preferenciasVisuais: {
    altoContraste: false,
    reducaoEstimulos: false,
    textoGrande: false,
  },
  metasDiarias: {
    horasSono: 8,
    tarefasPrioritarias: 3,
    coposAgua: 8,
    pausasProgramadas: 4,
  },
  notificacoesAtivas: true,
  pausasAtivas: true,
  isInitialized: false,
  isLoading: true,
};

// Função helper para enviar atualizações para o servidor
const updateProfileOnServer = async (updates: Partial<PerfilCompleto>) => {
  try {
    const response = await fetch('/api/v1/perfil', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar o perfil no servidor.');
    }
    console.log('Perfil atualizado no servidor com sucesso:', updates);
  } catch (error) {
    console.error(error);
    // Opcional: Adicionar lógica para reverter o estado em caso de falha
  }
};

export const usePerfilStore = create<PerfilState>((set, get) => ({
  ...(defaultState as PerfilState), // Cast inicial
  email: '', // Adicionar email ao estado padrão

  // Ação para inicializar a store com dados do backend
  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/perfil');
      if (!response.ok) {
        if (response.status === 401) {
          // Usuário não está logado, não fazer nada ou redirecionar
          console.log('Usuário não autenticado. Perfil não será carregado.');
          set({ isLoading: false, isInitialized: true }); // Marcar como inicializado para não tentar de novo
          return;
        }
        throw new Error('Falha ao buscar dados do perfil.');
      }
      const data: PerfilCompleto = await response.json();
      set({ ...data, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false, isInitialized: true }); // Mesmo em caso de erro, marcar como inicializado
    }
  },

  // Ação unificada para atualizar o perfil
  updateProfile: async (updates) => {
    const currentState = get();

    // Atualiza o estado local imediatamente para uma UI responsiva
    set({ ...currentState, ...updates });

    // Envia as atualizações para o servidor em segundo plano
    await updateProfileOnServer(updates);
  },

  // Ação de resetar (pode ser usada para logout)
  resetarPerfil: () => {
    set({ ...defaultState, email: '', isInitialized: false, isLoading: true });
  },
}));