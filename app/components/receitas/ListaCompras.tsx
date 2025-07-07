'use client';

import React, { useState, useMemo } from 'react';
import { useReceitasStore, Receita } from '../../stores/receitasStore';
import { Checkbox } from '../ui/Checkbox'; // Assuming Checkbox exists
import { Button } from '../ui/Button';
import { Input } from '../ui/Input'; // For portion adjustment

interface IngredienteAgrupado {
  nome: string;
  quantidadeTotal: number;
  unidade: string;
  key: string; // Unique key for state management (nome_unidade)
}

export function ListaCompras() {
  const { receitas } = useReceitasStore();
  const [receitasSelecionadas, setReceitasSelecionadas] = useState<string[]>([]);
  // Store portions as strings for input compatibility, parse when calculating
  const [porcoes, setPorcoes] = useState<Record<string, string>>({});
  const [itensComprados, setItensComprados] = useState<string[]>([]); // Store item keys (nome_unidade)

  // Initialize/update portions when a recipe is selected/deselected
  const toggleReceitaSelecionada = (id: string) => {
    const novasSelecionadas = [...receitasSelecionadas];
    const novasPorcoes = { ...porcoes };
    const receita = receitas.find(r => r.id === id);

    if (!receita) return;

    const index = novasSelecionadas.indexOf(id);
    if (index > -1) {
      novasSelecionadas.splice(index, 1); // Deselect
      delete novasPorcoes[id]; // Remove portion entry
    } else {
      novasSelecionadas.push(id); // Select
      novasPorcoes[id] = String(receita.porcoes || 1); // Initialize with recipe portions
    }
    setReceitasSelecionadas(novasSelecionadas);
    setPorcoes(novasPorcoes);
    // Optionally reset purchased items when selection changes
    // setItensComprados([]);
  };

  const atualizarPorcoes = (id: string, valor: string) => {
    // Allow empty input temporarily, default to 1 if invalid number
    const numValor = parseInt(valor, 10);
    setPorcoes({
      ...porcoes,
      [id]: valor // Store the raw string value
    });
  };

  // Memoize the shopping list generation for performance
  const listaCompras = useMemo<IngredienteAgrupado[]>(() => {
    const ingredientesAgrupados: Record<string, IngredienteAgrupado> = {};

    receitasSelecionadas.forEach(id => {
      const receita = receitas.find(r => r.id === id);
      if (!receita) return;

      const porcoesAtuais = parseInt(porcoes[id] || '1', 10) || 1; // Parse string, default to 1
      const porcoesOriginais = receita.porcoes || 1;
      const fatorMultiplicacao = porcoesOriginais > 0 ? porcoesAtuais / porcoesOriginais : 1;

      receita.ingredientes?.forEach(ing => {
        const chave = `${ing.nome.trim().toLowerCase()}_${ing.unidade}`; // Normalize key
        const quantidadeAjustada = (ing.quantidade || 0) * fatorMultiplicacao;

        if (ingredientesAgrupados[chave]) {
          ingredientesAgrupados[chave].quantidadeTotal += quantidadeAjustada;
        } else {
          ingredientesAgrupados[chave] = {
            nome: ing.nome.trim(),
            quantidadeTotal: quantidadeAjustada,
            unidade: ing.unidade,
            key: chave,
          };
        }
      });
    });

    return Object.values(ingredientesAgrupados)
      .filter(item => item.quantidadeTotal > 0) // Exclude items with zero quantity
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [receitas, receitasSelecionadas, porcoes]);

  const toggleItemComprado = (itemKey: string) => {
    setItensComprados(prev =>
      prev.includes(itemKey)
        ? prev.filter(key => key !== itemKey)
        : [...prev, itemKey]
    );
  };

  const formatarQuantidade = (qtd: number): string => {
     // Simple formatting, could be enhanced (e.g., fractions)
     if (qtd === 0) return '0';
     if (qtd < 0.1) return qtd.toFixed(2); // Show more precision for small amounts
     if (qtd % 1 === 0) return qtd.toFixed(0); // No decimals for whole numbers
     return qtd.toFixed(1); // One decimal place otherwise
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 border-b pb-3">Lista de Compras</h1>

      {/* Recipe Selection Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Selecione as Receitas</h2>
        {receitas.length === 0 ? (
          <p className="text-gray-500 italic">
            Nenhuma receita cadastrada. Adicione receitas primeiro.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {receitas.map(receita => (
              <div
                key={receita.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  receitasSelecionadas.includes(receita.id)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => toggleReceitaSelecionada(receita.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`receita-${receita.id}`}
                    checked={receitasSelecionadas.includes(receita.id)}
                    onChange={() => {}} // Click handled by container
                    className="mt-1"
                  />
                  <div className="flex-grow">
                    <label htmlFor={`receita-${receita.id}`} className="font-medium cursor-pointer">{receita.nome}</label>
                    {receitasSelecionadas.includes(receita.id) && (
                      <div className="mt-2 flex items-center gap-2">
                        <label htmlFor={`porcoes-${receita.id}`} className="text-sm">Porções:</label>
                        <Input
                          id={`porcoes-${receita.id}`}
                          type="number"
                          value={porcoes[receita.id] || String(receita.porcoes || 1)}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent card click
                            atualizarPorcoes(receita.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()} // Prevent card click
                          min={1}
                          className="w-16 h-8 text-sm p-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shopping List Section */}
      {receitasSelecionadas.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">2. Sua Lista de Compras</h2>
          {listaCompras.length === 0 ? (
            <p className="text-gray-500 italic">
              Nenhum ingrediente encontrado nas receitas selecionadas ou as quantidades resultaram em zero.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => setItensComprados([])}
                  variant="outline"
                  size="sm"
                  disabled={itensComprados.length === 0}
                >
                  Desmarcar Todos
                </Button>
                <Button
                  onClick={() => setItensComprados(listaCompras.map(i => i.key))}
                  variant="outline"
                  size="sm"
                  disabled={itensComprados.length === listaCompras.length}
                >
                  Marcar Todos Como Comprados
                </Button>
                {/* Add Print/Share button later */}
                 {/* <Button variant="outline" size="sm" onClick={() => window.print()}>Imprimir</Button> */}
              </div>

              <ul className="space-y-2 mb-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                {listaCompras.map((item) => {
                  const isComprado = itensComprados.includes(item.key);
                  return (
                    <li
                      key={item.key}
                      className={`flex items-center gap-3 p-2 border-b last:border-b-0 dark:border-gray-700 ${
                        isComprado ? 'opacity-60' : ''
                      }`}
                    >
                      <Checkbox
                        id={`item-${item.key}`}
                        checked={isComprado}
                        onChange={() => toggleItemComprado(item.key)}
                      />
                      <label
                        htmlFor={`item-${item.key}`}
                        className={`flex-grow cursor-pointer ${isComprado ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}
                      >
                        <span className="font-medium inline-block w-24 text-right mr-2">
                          {formatarQuantidade(item.quantidadeTotal)} {item.unidade}
                        </span>
                        <span>{item.nome}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {/* Add Share functionality later */}
              {/* <Button color="primary">Compartilhar Lista</Button> */}
            </>
          )}
        </section>
      )}
    </div>
  );
}
