import React from 'react';
import { Select } from '../ui/Select'; // Assuming Select component exists in ui directory

interface FiltroCategoriasProps {
  categoriaAtual: string;
  aoSelecionar: (categoria: string) => void;
  className?: string;
}

// Define categories directly in the component or fetch them from a store/API
const categorias = [
  { value: 'todas', label: 'Todas as Categorias' },
  { value: 'cafe_manha', label: 'Café da Manhã' },
  { value: 'almoco', label: 'Almoço' },
  { value: 'jantar', label: 'Jantar' },
  { value: 'lanche', label: 'Lanche' },
  { value: 'sobremesa', label: 'Sobremesa' },
  { value: 'bebida', label: 'Bebida' },
  // Add other categories as needed
];

export function FiltroCategorias({
  categoriaAtual,
  aoSelecionar,
  className = '',
}: FiltroCategoriasProps) {
  return (
    <div className={className}>
      <Select
        options={categorias}
        value={categoriaAtual}
        onChange={(e) => aoSelecionar(e.target.value)} // Extract value from event
        // placeholder prop removed
      />
    </div>
  );
}
