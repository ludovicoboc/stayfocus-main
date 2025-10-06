'use client'

import { useState, useMemo } from 'react';
import { useAutoconhecimentoStore } from '@/app/stores/autoconhecimentoStore';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { Input } from '@/app/components/ui/Input';
import { Search, Edit, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

type ListaNotasProps = {
  secaoAtual: 'quem-sou' | 'meus-porques' | 'meus-padroes';
  onSelectNota: (id: number) => void;
};

export function ListaNotas({ secaoAtual, onSelectNota }: ListaNotasProps) {
  const { notas, removerNota, modoRefugio, isLoading, isInitialized } = useAutoconhecimentoStore();
  const [termoBusca, setTermoBusca] = useState('');
  
  const notasSecao = useMemo(() => {
    const notasFiltradas = termoBusca
      ? notas.filter(nota =>
          nota.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
          nota.conteudo.toLowerCase().includes(termoBusca.toLowerCase()) ||
          nota.tags.some(tag => tag.toLowerCase().includes(termoBusca.toLowerCase()))
        )
      : notas;
    
    return notasFiltradas
      .filter(nota => nota.secao === secaoAtual)
      .sort((a, b) => new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime());
  }, [notas, secaoAtual, termoBusca]);
  
  const handleRemoverNota = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      await removerNota(id);
    }
  };
  
  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  if (isLoading && !isInitialized) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-autoconhecimento-primary" /></div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input type="text" placeholder="Buscar notas..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} className="pl-10" />
      </div>
      
      <div className="space-y-3">
        {notasSecao.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            {termoBusca ? 'Nenhuma nota encontrada' : 'Nenhuma nota nesta seção'}
          </p>
        ) : (
          notasSecao.map((nota) => (
            <Card key={nota.id}>
              <div className="p-4 cursor-pointer hover:shadow-md border-l-4" style={{ borderColor: 'var(--color-autoconhecimento-primary)' }} onClick={() => onSelectNota(nota.id)}>
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-medium line-clamp-1">{nota.titulo}</h4>
                  <div className="flex space-x-1">
                    {!modoRefugio && (
                      <>
                        <button className="p-1" onClick={(e) => { e.stopPropagation(); onSelectNota(nota.id); }}><Edit size={16} /></button>
                        <button className="p-1" onClick={(e) => handleRemoverNota(nota.id, e)}><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm mt-2 line-clamp-2">{nota.conteudo}</p>
                {nota.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {nota.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                  </div>
                )}
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                  <span>Atualizado em {formatarData(nota.dataAtualizacao)}</span>
                  {nota.imagemUrl && <span className="flex items-center"><ImageIcon size={12} className="mr-1" />Âncora visual</span>}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}