'use client'; // Required for client-side data fetching (useReceitasStore)

import { AdicionarReceitaForm } from '../../../components/receitas/AdicionarReceitaForm';
import { useReceitasStore } from '../../../stores/receitasStore';
import { useParams } from 'next/navigation'; // Hook to get route parameters

// This page renders the form for editing an existing recipe.
export default function EditarReceitaPage() {
  const params = useParams();
  const { obterReceitaPorId } = useReceitasStore();

  // Wait until params are available
  if (!params) {
    return <p className="p-4 text-center text-gray-500">Carregando...</p>; // Or a loading spinner
  }

  // Get the recipe ID from the route parameters
  const id = typeof params.id === 'string' ? params.id : undefined;

  // Fetch the recipe data using the ID
  const receitaParaEditar = id ? obterReceitaPorId(id) : undefined;

  if (!id) {
    // Handle case where ID is missing (shouldn't normally happen with file-based routing)
    return <p className="p-4 text-center text-red-500">ID da receita não encontrado na URL.</p>;
  }

  if (!receitaParaEditar) {
    // Handle case where recipe with the given ID doesn't exist
    // You might want to redirect or show a more specific error
    return <p className="p-4 text-center text-gray-500">Receita com ID '{id}' não encontrada.</p>;
  }

  // Pass the fetched recipe data to the form component
  return <AdicionarReceitaForm receitaParaEditar={receitaParaEditar} />;
}
