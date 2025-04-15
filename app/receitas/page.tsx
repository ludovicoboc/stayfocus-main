'use client'; // Required for useState and other client-side hooks

import { useState } from 'react';
import { ListaReceitas } from '../components/receitas/ListaReceitas';
import { FiltroCategorias } from '../components/receitas/FiltroCategorias';
import { Pesquisa } from '../components/ui/Pesquisa'; // Corrected path
import { useReceitasStore } from '../stores/receitasStore';
import { Button } from '../components/ui/Button'; // Import Button
import Link from 'next/link'; // Import Link
import { ImportadorReceitas } from '../components/receitas/ImportadorReceitas'; // Import the new component

export default function ReceitasPage() {
  const { receitas } = useReceitasStore();
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [termoPesquisa, setTermoPesquisa] = useState('');

  const receitasFiltradas = receitas
    .filter(receita =>
      filtroCategoria === 'todas' || (receita.categorias && receita.categorias.includes(filtroCategoria))
    )
    .filter(receita => {
      const termo = termoPesquisa.toLowerCase();
      const nomeMatch = receita.nome.toLowerCase().includes(termo);
      const ingredienteMatch = receita.ingredientes?.some(ing =>
        ing.nome.toLowerCase().includes(termo)
      );
      // Add description and tag search if needed
      // const descricaoMatch = receita.descricao?.toLowerCase().includes(termo);
      // const tagMatch = receita.tags?.some(tag => tag.toLowerCase().includes(termo));
      return nomeMatch || ingredienteMatch; // || descricaoMatch || tagMatch;
    });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Minhas Receitas</h1>
        <Link href="/receitas/adicionar" passHref>
           <Button color="primary">Adicionar Nova Receita</Button>
        </Link>
      </div>

      {/* Import Component Added Here */}
      <ImportadorReceitas />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Pesquisa
          placeholder="Buscar por nome ou ingrediente"
          valor={termoPesquisa}
          aoMudar={setTermoPesquisa}
          className="flex-grow" // Allow search bar to grow
        />
        <FiltroCategorias
          categoriaAtual={filtroCategoria}
          aoSelecionar={setFiltroCategoria}
          className="w-full sm:w-auto sm:min-w-[200px]" // Set min-width on smaller screens
        />
         <Link href="/receitas/lista-compras" passHref>
           <Button variant="outline">Lista de Compras</Button>
         </Link>
      </div>

      <ListaReceitas receitas={receitasFiltradas} />
    </div>
  );
}
