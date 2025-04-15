'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { useReceitasStore, Receita } from '../../stores/receitasStore';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert'; // Assuming Alert component exists for feedback

// Helper function to validate a single recipe object
const validarReceita = (obj: any): obj is Partial<Receita> => {
  if (typeof obj !== 'object' || obj === null) return false;

  // Check required fields (adjust based on strictness)
  if (typeof obj.nome !== 'string' || !obj.nome.trim()) return false;
  if (!Array.isArray(obj.ingredientes) || obj.ingredientes.length === 0) return false;
  if (!Array.isArray(obj.passos) || obj.passos.length === 0) return false;

  // Basic type checks for ingredients and steps
  if (!obj.ingredientes.every((ing: any) => typeof ing.nome === 'string' && typeof ing.quantidade === 'number' && typeof ing.unidade === 'string')) return false;
  if (!obj.passos.every((passo: any) => typeof passo === 'string')) return false;

  // Optional fields type checks (add more as needed)
  if (obj.descricao && typeof obj.descricao !== 'string') return false;
  if (obj.categorias && !Array.isArray(obj.categorias)) return false;
  if (obj.tags && !Array.isArray(obj.tags)) return false;
  if (obj.tempoPreparo && typeof obj.tempoPreparo !== 'number') return false;
  if (obj.porcoes && typeof obj.porcoes !== 'number') return false;
  if (obj.calorias && typeof obj.calorias !== 'string') return false; // Allow string for flexibility
  if (obj.imagem && typeof obj.imagem !== 'string') return false;

  return true;
};

export function ImportadorReceitas() {
  const { adicionarReceita } = useReceitasStore();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      let receitasParaAdicionar: Receita[] = [];

      // Check if it's an array (multiple recipes) or single object
      if (Array.isArray(jsonData)) {
        jsonData.forEach((item, index) => {
          if (validarReceita(item)) {
            const validatedItem = item as Partial<Receita>; // Keep partial for optional fields
            // Construct the object explicitly to satisfy the Receita type
            receitasParaAdicionar.push({
              id: Date.now().toString() + index,
              nome: validatedItem.nome!, // Assert non-null (checked by validarReceita)
              descricao: validatedItem.descricao || '', // Default for optional
              categorias: validatedItem.categorias || [], // Default
              tags: validatedItem.tags || [], // Default
              tempoPreparo: validatedItem.tempoPreparo || 0, // Default
              porcoes: validatedItem.porcoes || 1, // Default
              calorias: validatedItem.calorias || '', // Default
              imagem: validatedItem.imagem || '', // Default
              ingredientes: validatedItem.ingredientes!, // Assert non-null (checked by validarReceita)
              passos: validatedItem.passos!, // Assert non-null (checked by validarReceita)
            });
          } else {
            console.warn(`Item ${index + 1} no JSON inválido ou incompleto. Ignorando.`);
            // Optionally provide more specific feedback
          }
        });
      } else if (validarReceita(jsonData)) {
         const validatedItem = jsonData as Partial<Receita>;
         // Construct the object explicitly to satisfy the Receita type
         receitasParaAdicionar.push({
            id: Date.now().toString(),
            nome: validatedItem.nome!, // Assert non-null
            descricao: validatedItem.descricao || '',
            categorias: validatedItem.categorias || [],
            tags: validatedItem.tags || [],
            tempoPreparo: validatedItem.tempoPreparo || 0,
            porcoes: validatedItem.porcoes || 1,
            calorias: validatedItem.calorias || '',
            imagem: validatedItem.imagem || '',
            ingredientes: validatedItem.ingredientes!, // Assert non-null
            passos: validatedItem.passos!, // Assert non-null
         });
      } else {
        throw new Error('Estrutura do JSON inválida. Esperado um objeto de receita ou um array de objetos de receita.');
      }

      if (receitasParaAdicionar.length === 0) {
         throw new Error('Nenhuma receita válida encontrada no arquivo JSON.');
      }

      // Add recipes to the store
      receitasParaAdicionar.forEach(receita => {
        // TODO: Consider adding duplicate check here before adding
        adicionarReceita(receita);
      });

      setFeedback({ type: 'success', message: `${receitasParaAdicionar.length} receita(s) importada(s) com sucesso!` });

    } catch (error: any) {
      console.error("Erro ao importar receitas:", error);
      setFeedback({ type: 'error', message: `Erro ao importar: ${error.message || 'Verifique o formato do arquivo JSON.'}` });
    } finally {
      setIsLoading(false);
      // Reset file input to allow importing the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="my-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
       <h3 className="text-lg font-medium mb-2">Importar Receitas</h3>
       <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
         Selecione um arquivo `.json` contendo uma única receita ou um array de receitas para importar.
         {/* TODO: Add link to documentation/example format */}
       </p>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} // Hide the default input
        disabled={isLoading}
      />
      <Button
        onClick={triggerFileInput}
        disabled={isLoading}
        variant="outline"
      >
        {isLoading ? 'Importando...' : 'Selecionar Arquivo JSON'}
      </Button>

      {feedback && (
        <Alert variant={feedback.type} className="mt-4"> {/* Changed 'type' to 'variant' */}
          {feedback.message}
        </Alert>
      )}
    </div>
  );
}
