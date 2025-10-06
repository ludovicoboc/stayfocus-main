import { create } from 'zustand';

// Tipo de dado para um medicamento, alinhado com o schema do DB
export type Medicamento = {
  id: number;
  nome: string;
  dosagem: string;
  frequencia: string;
  horarios: string[];
  observacoes: string;
  dataInicio: string;
  ultimaTomada: string | null;
  intervalo?: number;
};

// Estado da store
interface MedicamentosState {
  medicamentos: Medicamento[];
  isInitialized: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  adicionarMedicamento: (medicamento: Omit<Medicamento, 'id' | 'ultimaTomada'>) => Promise<void>;
  atualizarMedicamento: (id: number, updates: Partial<Medicamento>) => Promise<void>;
  removerMedicamento: (id: number) => Promise<void>;
  registrarTomada: (id: number, dataHora: string) => Promise<void>;
}

export const useMedicamentosStore = create<MedicamentosState>((set, get) => ({
  medicamentos: [],
  isInitialized: false,
  isLoading: true,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/saude/medicamentos');
      if (!response.ok) {
        throw new Error('Falha ao buscar medicamentos.');
      }
      const data: Medicamento[] = await response.json();
      set({ medicamentos: data, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  adicionarMedicamento: async (medicamento) => {
    try {
      const response = await fetch('/api/v1/saude/medicamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicamento),
      });
      if (!response.ok) throw new Error('Falha ao adicionar medicamento.');
      const novoMedicamento = await response.json();
      set((state) => ({
        medicamentos: [...state.medicamentos, novoMedicamento],
      }));
    } catch (error) {
      console.error(error);
    }
  },

  atualizarMedicamento: async (id, updates) => {
    const originalMedicamentos = get().medicamentos;
    const medicamentosAtualizados = originalMedicamentos.map((med) =>
      med.id === id ? { ...med, ...updates } : med
    );
    set({ medicamentos: medicamentosAtualizados });
    try {
      const response = await fetch(`/api/v1/saude/medicamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Falha ao atualizar medicamento.');
    } catch (error) {
      console.error(error);
      set({ medicamentos: originalMedicamentos }); // Reverter
    }
  },

  removerMedicamento: async (id) => {
    const originalMedicamentos = get().medicamentos;
    set((state) => ({
      medicamentos: state.medicamentos.filter((med) => med.id !== id),
    }));
    try {
      const response = await fetch(`/api/v1/saude/medicamentos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao remover medicamento.');
    } catch (error) {
      console.error(error);
      set({ medicamentos: originalMedicamentos }); // Reverter
    }
  },

  registrarTomada: async (id, dataHora) => {
    // Ação específica para registrar a tomada, que é uma forma de atualização
    get().atualizarMedicamento(id, { ultimaTomada: dataHora });
  },
}));