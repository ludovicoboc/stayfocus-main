'use client'

import { useEffect, useState, useMemo } from 'react';
import { useFinancasStore } from '@/app/stores/financasStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Home, ShoppingCart, Utensils, Car, Heart, Music, Loader2 } from 'lucide-react';

const iconesMapeados: Record<string, React.ReactNode> = {
  'home': <Home className="h-5 w-5" />,
  'shopping-cart': <ShoppingCart className="h-5 w-5" />,
  'utensils': <Utensils className="h-5 w-5" />,
  'car': <Car className="h-5 w-5" />,
  'heart': <Heart className="h-5 w-5" />,
  'music': <Music className="h-5 w-5" />,
};

export default function RastreadorGastos() { 
  const { categorias, transacoes, isLoading, isInitialized } = useFinancasStore();

  const { dadosGrafico, totalGastos } = useMemo(() => {
    const despesas = transacoes.filter(t => t.tipo === 'despesa');
    const total = despesas.reduce((acc, t) => acc + t.valor, 0);
    
    const gastosPorCategoria: Record<number, number> = {};
    despesas.forEach(transacao => {
      if (!gastosPorCategoria[transacao.categoriaId]) {
        gastosPorCategoria[transacao.categoriaId] = 0;
      }
      gastosPorCategoria[transacao.categoriaId] += transacao.valor;
    });
    
    const dados = Object.entries(gastosPorCategoria).map(([categoriaId, valor]) => {
      const categoria = categorias.find(c => c.id === Number(categoriaId));
      return {
        name: categoria ? categoria.nome : 'Outros',
        value: valor,
        cor: categoria ? categoria.cor : '#CCCCCC'
      };
    });
    
    return { dadosGrafico: dados, totalGastos: total };
  }, [transacoes, categorias]);
  
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatadorPorcentagem = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentual = totalGastos > 0 ? data.value / totalGastos : 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{formatadorMoeda.format(data.value)}</p>
          <p className="text-xs text-gray-500">{formatadorPorcentagem.format(percentual)}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading && !isInitialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-financas-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {dadosGrafico.length > 0 ? (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dadosGrafico} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                {dadosGrafico.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.cor} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>Sem despesas registradas.</p>
        </div>
      )}
      
      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Total de Gastos: {formatadorMoeda.format(totalGastos)}
        </h3>
        {categorias.map(categoria => {
          const dadoCategoria = dadosGrafico.find(d => d.name === categoria.nome);
          const valorCategoria = dadoCategoria ? dadoCategoria.value : 0;
          const percentual = totalGastos > 0 ? valorCategoria / totalGastos : 0;
          
          return (
            <div key={categoria.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: `${categoria.cor}20` }}>
              <div className="flex items-center">
                <div className="p-1 rounded-full mr-2" style={{ backgroundColor: categoria.cor }}>
                  <span className="text-white">{iconesMapeados[categoria.icone] || <ShoppingCart className="h-5 w-5" />}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{categoria.nome}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatadorMoeda.format(valorCategoria)}</div>
                <div className="text-xs text-gray-500">{formatadorPorcentagem.format(percentual)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}