'use client'

import { useState, useEffect } from 'react';
import { RefreshCw, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { useSugestoesStore } from '@/app/stores/sugestoesStore';

const atividadesDescanso = {
  rapidas: ["Respire fundo por 2 minutos", "Tome um copo de água", "Alongue o pescoço e ombros"],
  criativas: ["Desenhe algo abstrato", "Escreva um haiku", "Crie uma pequena colagem"],
  físicas: ["Dance uma música animada", "Faça 10 agachamentos", "Caminhe por 5 minutos"],
  relaxantes: ["Medite por 5 minutos", "Faça uma massagem nas mãos", "Prepare um chá"],
};

type Categoria = keyof typeof atividadesDescanso;

export function SugestoesDescanso() {
  const { sugestoesFavoritas, adicionarFavorita, removerFavorita, isLoading, isInitialized } = useSugestoesStore();
  const [sugestaoAtual, setSugestaoAtual] = useState('');
  const [categoriaAtual, setCategoriaAtual] = useState<Categoria>('rapidas');
  
  const gerarSugestaoAleatoria = () => {
    const categorias = Object.keys(atividadesDescanso) as Categoria[];
    const categoriaAleatoria = categorias[Math.floor(Math.random() * categorias.length)];
    const atividadesCategoria = atividadesDescanso[categoriaAleatoria];
    const sugestaoAleatoria = atividadesCategoria[Math.floor(Math.random() * atividadesCategoria.length)];
    setSugestaoAtual(sugestaoAleatoria);
    setCategoriaAtual(categoriaAleatoria);
  };

  useEffect(() => {
    gerarSugestaoAleatoria();
  }, []);

  const estaNasFavoritas = sugestoesFavoritas.some(fav => fav.sugestao === sugestaoAtual);

  const toggleFavorita = async () => {
    if (estaNasFavoritas) {
      await removerFavorita(sugestaoAtual);
    } else {
      await adicionarFavorita(sugestaoAtual);
    }
  };

  const getNomeCategoria = (categoria: Categoria) => ({
    rapidas: 'Rápidas', criativas: 'Criativas', físicas: 'Físicas', relaxantes: 'Relaxantes'
  })[categoria];

  const getCorCategoria = (categoria: Categoria) => ({
    rapidas: 'bg-blue-100 text-blue-800', criativas: 'bg-purple-100 text-purple-800',
    físicas: 'bg-green-100 text-green-800', relaxantes: 'bg-amber-100 text-amber-800'
  })[categoria];

  if (isLoading && !isInitialized) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-lazer-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={gerarSugestaoAleatoria} size="sm"><RefreshCw className="h-4 w-4 mr-2" />Nova Sugestão</Button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center relative">
        {sugestaoAtual && (
          <>
            <Badge className={`absolute top-3 left-3 ${getCorCategoria(categoriaAtual)}`}>{getNomeCategoria(categoriaAtual)}</Badge>
            <p className="text-xl font-medium mt-4">{sugestaoAtual}</p>
            <div className="flex justify-center mt-6 space-x-3">
              <Button variant={estaNasFavoritas ? "primary" : "outline"} size="sm" onClick={toggleFavorita}>
                <Heart className={`h-4 w-4 mr-2 ${estaNasFavoritas ? 'fill-white' : ''}`} />
                {estaNasFavoritas ? 'Favorita' : 'Favoritar'}
              </Button>
            </div>
          </>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Sugestões Favoritas</h3>
        {sugestoesFavoritas.length === 0 ? (
          <div className="text-center py-4 text-gray-500"><Heart className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>Nenhuma sugestão favorita ainda.</p></div>
        ) : (
          <div className="space-y-2">
            {sugestoesFavoritas.map((fav) => (
              <div key={fav.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                <p>{fav.sugestao}</p>
                <Button variant="ghost" size="sm" onClick={() => removerFavorita(fav.sugestao)}>
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}