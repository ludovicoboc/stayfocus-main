'use client'

import { useState, useRef, useEffect } from 'react';
import { useAutoconhecimentoStore, Nota } from '@/app/stores/autoconhecimentoStore';
import { Button } from '@/app/components/ui/Button';
import { Textarea } from '@/app/components/ui/Textarea';
import { Input } from '@/app/components/ui/Input';
import { Badge } from '@/app/components/ui/Badge';
import { X, Image as ImageIcon, Save, Loader2 } from 'lucide-react';

type EditorNotasProps = {
  id?: number;
  secaoAtual: 'quem-sou' | 'meus-porques' | 'meus-padroes';
  onSave?: () => void;
};

export function EditorNotas({ id, secaoAtual, onSave }: EditorNotasProps) {
  const { notas, adicionarNota, atualizarNota, modoRefugio } = useAutoconhecimentoStore();
  
  const nota = id ? notas.find(n => n.id === id) : undefined;
  
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imagemUrl, setImagemUrl] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (nota) {
      setTitulo(nota.titulo);
      setConteudo(nota.conteudo);
      setTags(nota.tags);
      setImagemUrl(nota.imagemUrl);
    } else {
      // Reset for new note
      setTitulo('');
      setConteudo('');
      setTags([]);
      setImagemUrl(undefined);
    }
  }, [nota]);
  
  const handleAdicionarTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoverTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };
  
  const handleSalvar = async () => {
    if (!titulo.trim() || !conteudo.trim()) return;
    
    setIsSubmitting(true);
    
    const dadosNota = {
      titulo,
      conteudo,
      secao: secaoAtual,
      tags,
      imagemUrl,
    };

    try {
      if (id) {
        await atualizarNota(id, dadosNota);
      } else {
        await adicionarNota(dadosNota);
      }
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
        console.error("Erro ao salvar nota:", error);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`space-y-4 ${modoRefugio ? 'opacity-90' : ''}`}>
      <Input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título da nota"
        className="text-lg font-medium"
      />
      
      <Textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="O que você quer registrar?"
        className="min-h-[200px]"
      />
      
      {!modoRefugio && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Badge key={tag}>
                {tag}
                <button onClick={() => handleRemoverTag(tag)} className="ml-1 rounded-full p-0.5"><X size={14} /></button>
              </Badge>
            ))}
            <div className="flex">
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdicionarTag())}
                placeholder="Adicionar tag"
                className="text-sm w-32"
              />
              <Button onClick={handleAdicionarTag} className="ml-2">Adicionar</Button>
            </div>
          </div>
          
          <div className="mt-4">
            {imagemUrl ? (
              <div className="relative">
                <img src={imagemUrl} alt="Imagem âncora" className="max-h-60 rounded-md border" />
                <button onClick={() => setImagemUrl(undefined)} className="absolute top-2 right-2 bg-white rounded-full p-1"><X size={18} /></button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Input type="text" value={imagemUrl || ''} onChange={(e) => setImagemUrl(e.target.value)} placeholder="URL da imagem âncora" className="text-sm flex-1" />
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="flex justify-end">
        <Button onClick={handleSalvar} disabled={!titulo.trim() || !conteudo.trim() || isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} className="mr-1" />}
          Salvar
        </Button>
      </div>
    </div>
  );
}