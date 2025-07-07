import React from 'react';
import Link from 'next/link';
import { Receita } from '../../stores/receitasStore'; // Import the Receita type
import { Card } from '../ui/Card'; // Assuming Card component exists
import { Tag } from '../ui/Tag'; // Import Tag component

interface ListaReceitasProps {
  receitas: Receita[];
}

export function ListaReceitas({ receitas }: ListaReceitasProps) {
  if (receitas.length === 0) {
    return <p className="text-gray-500">Nenhuma receita encontrada.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {receitas.map((receita) => (
        <Link href={`/receitas/${receita.id}`} key={receita.id} legacyBehavior>
          <a className="block group">
            <Card className="h-full flex flex-col transition-shadow duration-200 group-hover:shadow-lg">
              <div className="relative h-40 w-full bg-gray-200 rounded-t-lg overflow-hidden">
                {receita.imagem ? (
                  <img
                    src={receita.imagem}
                    alt={receita.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>Sem imagem</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600">
                  {receita.nome}
                </h3>
                {receita.descricao && (
                   <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                     {receita.descricao}
                   </p>
                )}
                <div className="mt-auto pt-2">
                   {receita.tags?.slice(0, 3).map((tag) => (
                     <Tag key={tag} className="mr-1 mb-1">{tag}</Tag>
                   ))}
                   {receita.tags?.length > 3 && <Tag className="mr-1 mb-1">...</Tag>}
                </div>
              </div>
            </Card>
          </a>
        </Link>
      ))}
    </div>
  );
}
