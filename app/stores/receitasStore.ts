// stores/receitasStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Ingrediente {
  nome: string;
  quantidade: number;
  unidade: string;
}

export interface Receita { // Exporting the interface
  id: string;
  nome: string;
  descricao: string;
  categorias: string[];
  tags: string[];
  tempoPreparo: number;
  porcoes: number;
  calorias: string;
  imagem: string; // Store image URL or base64 string
  ingredientes: Ingrediente[];
  passos: string[];
}

interface ReceitasStore {
  receitas: Receita[];
  adicionarReceita: (receita: Receita) => void;
  atualizarReceita: (receita: Receita) => void;
  removerReceita: (id: string) => void;
  obterReceitaPorId: (id: string) => Receita | undefined;
  favoritos: string[];
  alternarFavorito: (id: string) => void;
}

export const useReceitasStore = create<ReceitasStore>()(
  persist(
    (set, get) => ({
      receitas: [],
      adicionarReceita: (receita) =>
        set((state) => ({ receitas: [...state.receitas, receita] })),
      atualizarReceita: (receita) =>
        set((state) => ({
          receitas: state.receitas.map((r) =>
            r.id === receita.id ? receita : r
          ),
        })),
      removerReceita: (id) =>
        set((state) => ({
          receitas: state.receitas.filter((r) => r.id !== id),
        })),
      obterReceitaPorId: (id) => {
        return get().receitas.find((r) => r.id === id);
      },
      favoritos: [],
      alternarFavorito: (id) =>
        set((state) => {
          const { favoritos } = state;
          if (favoritos.includes(id)) {
            return { favoritos: favoritos.filter((fav) => fav !== id) };
          } else {
            return { favoritos: [...favoritos, id] };
          }
        }),
    }),
    {
      name: 'receitas-storage', // name of the item in the storage (must be unique)
      // storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
