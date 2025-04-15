'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useReceitasStore, Receita } from '../../stores/receitasStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { TagInput } from '../ui/TagInput';
import { useRouter } from 'next/navigation';

// Define types for form state management
type IngredienteForm = { nome: string; quantidade: string; unidade: string }; // Use string for quantity input
type ReceitaFormState = Omit<Receita, 'id' | 'ingredientes' | 'tempoPreparo' | 'porcoes'> & {
    tempoPreparo: string; // Use string for input
    porcoes: string;      // Use string for input
    ingredientes: IngredienteForm[];
};

interface AdicionarReceitaFormProps {
  receitaParaEditar?: Receita | null; // Allow null or undefined
  aoFinalizar?: (receitaSalva: Receita) => void; // Callback after save/cancel
}

export function AdicionarReceitaForm({ receitaParaEditar, aoFinalizar }: AdicionarReceitaFormProps) {
  const router = useRouter();
  const { adicionarReceita, atualizarReceita } = useReceitasStore();
  const editando = !!receitaParaEditar;

  const initialState: ReceitaFormState = {
    nome: '',
    descricao: '',
    categorias: [],
    tags: [],
    tempoPreparo: '30',
    porcoes: '2',
    calorias: '',
    imagem: '', // Store URL or base64 string
    ingredientes: [{ nome: '', quantidade: '1', unidade: 'g' }],
    passos: [''],
  };

  const [receita, setReceita] = useState<ReceitaFormState>(initialState);
  const [previewImagem, setPreviewImagem] = useState<string | null>(receitaParaEditar?.imagem || null);

  // Populate form if editing
  useEffect(() => {
    if (editando && receitaParaEditar) {
      setReceita({
        ...receitaParaEditar,
        // Convert numbers/arrays back to string/correct format for form state
        tempoPreparo: String(receitaParaEditar.tempoPreparo || '30'),
        porcoes: String(receitaParaEditar.porcoes || '2'),
        calorias: String(receitaParaEditar.calorias || ''),
        ingredientes: receitaParaEditar.ingredientes.map(ing => ({
            ...ing,
            quantidade: String(ing.quantidade) // Convert quantity to string for input
        })) || [{ nome: '', quantidade: '1', unidade: 'g' }],
        passos: receitaParaEditar.passos || [''],
        categorias: receitaParaEditar.categorias || [],
        tags: receitaParaEditar.tags || [],
      });
      setPreviewImagem(receitaParaEditar.imagem || null);
    } else {
        setReceita(initialState); // Reset form if not editing
        setPreviewImagem(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receitaParaEditar, editando]); // Rerun effect if receitaParaEditar changes


  const opcoesUnidades = [
    { value: 'g', label: 'gramas (g)' },
    { value: 'kg', label: 'quilos (kg)' },
    { value: 'ml', label: 'mililitros (ml)' },
    { value: 'l', label: 'litros (l)' },
    { value: 'unidade', label: 'unidade(s)' },
    { value: 'colher_sopa', label: 'colher(es) de sopa' },
    { value: 'colher_cha', label: 'colher(es) de chá' },
    { value: 'xicara', label: 'xícara(s)' },
    { value: 'pitada', label: 'pitada(s)' },
    { value: 'a_gosto', label: 'a gosto' },
  ];

  const categoriasDisponiveis = [
    { value: 'cafe_manha', label: 'Café da Manhã' },
    { value: 'almoco', label: 'Almoço' },
    { value: 'jantar', label: 'Jantar' },
    { value: 'lanche', label: 'Lanche' },
    { value: 'sobremesa', label: 'Sobremesa' },
    { value: 'bebida', label: 'Bebida' },
    { value: 'acompanhamento', label: 'Acompanhamento' },
    { value: 'sopa', label: 'Sopa' },
    { value: 'salada', label: 'Salada' },
  ];

  const tagsSugeridas = ['Sem Glúten', 'Vegano', 'Vegetariano', 'Low Carb', 'Rápido', 'Fácil', 'Saudável', 'Festa', 'Doce', 'Salgado'];

  const atualizarCampo = (campo: keyof ReceitaFormState, valor: any) => {
    setReceita(prev => ({ ...prev, [campo]: valor }));
  };

  // --- Ingredient Handlers ---
  const atualizarIngrediente = (index: number, campo: keyof IngredienteForm, valor: string) => {
    const novosIngredientes = [...receita.ingredientes];
    novosIngredientes[index] = { ...novosIngredientes[index], [campo]: valor };
    atualizarCampo('ingredientes', novosIngredientes);
  };

  const adicionarIngrediente = () => {
    atualizarCampo('ingredientes', [...receita.ingredientes, { nome: '', quantidade: '1', unidade: 'g' }]);
  };

  const removerIngrediente = (index: number) => {
    if (receita.ingredientes.length <= 1) return; // Keep at least one ingredient row
    const novosIngredientes = receita.ingredientes.filter((_, i) => i !== index);
    atualizarCampo('ingredientes', novosIngredientes);
  };

  // --- Step Handlers ---
   const atualizarPasso = (index: number, valor: string) => {
     const novosPassos = [...receita.passos];
     novosPassos[index] = valor;
     atualizarCampo('passos', novosPassos);
   };

   const adicionarPasso = () => {
     atualizarCampo('passos', [...receita.passos, '']);
   };

   const removerPasso = (index: number) => {
     if (receita.passos.length <= 1) return; // Keep at least one step row
     const novosPassos = receita.passos.filter((_, i) => i !== index);
     atualizarCampo('passos', novosPassos);
   };

   // --- Image Handler ---
   const handleImagemChange = (e: ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       // Basic preview using FileReader (more robust than createObjectURL for state)
       const reader = new FileReader();
       reader.onloadend = () => {
         const result = reader.result as string;
         setPreviewImagem(result); // Show preview
         atualizarCampo('imagem', result); // Store base64 string or prepare for upload
       };
       reader.readAsDataURL(file);

       // TODO: Implement actual upload logic here if needed
       // e.g., upload to S3/Cloudinary and store the URL in 'imagem' field
       // For now, we store the base64 representation for simplicity
     } else {
       setPreviewImagem(null);
       atualizarCampo('imagem', '');
     }
   };

  // --- Form Submission ---
  const salvarReceita = (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    // Basic Validation
    if (!receita.nome || receita.ingredientes.some(ing => !ing.nome.trim()) || receita.passos.some(p => !p.trim())) {
      alert('Por favor, preencha o nome da receita, pelo menos um ingrediente e um passo do modo de preparo.');
      return;
    }

    // Prepare data for saving (convert strings back to numbers)
    const receitaParaSalvar: Receita = {
      ...receita,
      id: receitaParaEditar?.id || Date.now().toString(), // Use existing ID or generate new one
      tempoPreparo: parseInt(receita.tempoPreparo, 10) || 0,
      porcoes: parseInt(receita.porcoes, 10) || 1,
      calorias: receita.calorias, // Keep as string or parse if needed
      ingredientes: receita.ingredientes.map(ing => ({
        ...ing,
        quantidade: parseFloat(ing.quantidade.replace(',', '.')) || 0 // Handle comma decimal and parse
      })),
      // Ensure arrays are not empty strings
      passos: receita.passos.filter(p => p.trim() !== ''),
      categorias: receita.categorias || [],
      tags: receita.tags || [],
    };

    try {
        if (editando) {
          atualizarReceita(receitaParaSalvar);
          alert('Receita atualizada com sucesso!');
        } else {
          adicionarReceita(receitaParaSalvar);
          alert('Receita adicionada com sucesso!');
        }

        if (aoFinalizar) {
          aoFinalizar(receitaParaSalvar);
        } else {
          // Default behavior: redirect to the recipe details page
          router.push(`/receitas/${receitaParaSalvar.id}`);
        }
    } catch (error) {
        console.error("Erro ao salvar receita:", error);
        alert("Ocorreu um erro ao salvar a receita. Verifique o console para mais detalhes.");
    }
  };

  const handleCancel = () => {
    if (aoFinalizar) {
        aoFinalizar(null as any); // Indicate cancellation if using callback
    } else {
        router.back(); // Go back to the previous page
    }
  }

  return (
    <form onSubmit={salvarReceita} className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 border-b pb-3">
        {editando ? 'Editar Receita' : 'Adicionar Nova Receita'}
      </h1>

      {/* Basic Info Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nome" className="block mb-2 font-medium text-sm">Nome da Receita*</label>
            <Input
              id="nome"
              value={receita.nome}
              onChange={(e) => atualizarCampo('nome', e.target.value)}
              placeholder="Ex: Bolo de Cenoura Fofinho"
              required
            />
          </div>
          <div>
            <label htmlFor="categorias" className="block mb-2 font-medium text-sm">Categorias</label>
            <Select
              id="categorias"
              options={categoriasDisponiveis}
              value={receita.categorias}
              onChange={(e) => {
                  // Handle multi-select: get all selected options
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  atualizarCampo('categorias', selectedOptions);
              }}
              multiple // Enable multiple selections
              className="h-auto" // Adjust height for multi-select
            />
             <p className="text-xs text-gray-500 mt-1">Segure Ctrl/Cmd para selecionar múltiplas.</p>
          </div>
        </div>
        <div>
          <label htmlFor="descricao" className="block mb-2 font-medium text-sm">Descrição Breve</label>
          <Textarea
            id="descricao"
            value={receita.descricao}
            onChange={(e) => atualizarCampo('descricao', e.target.value)}
            placeholder="Uma breve descrição sobre a receita, dicas, etc."
            rows={3}
          />
        </div>
      </section>

      {/* Details Section */}
       <section className="space-y-4">
         <h2 className="text-xl font-semibold">Detalhes</h2>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           <div>
             <label htmlFor="tempoPreparo" className="block mb-2 font-medium text-sm">Tempo de Preparo (min)*</label>
             <Input
               id="tempoPreparo"
               type="number"
               value={receita.tempoPreparo}
               onChange={(e) => atualizarCampo('tempoPreparo', e.target.value)}
               min={1}
               required
             />
           </div>
           <div>
             <label htmlFor="porcoes" className="block mb-2 font-medium text-sm">Porções*</label>
             <Input
               id="porcoes"
               type="number"
               value={receita.porcoes}
               onChange={(e) => atualizarCampo('porcoes', e.target.value)}
               min={1}
               required
             />
           </div>
           <div>
             <label htmlFor="calorias" className="block mb-2 font-medium text-sm">Calorias (por porção)</label>
             <Input
               id="calorias"
               type="text" // Use text to allow ranges or 'N/A'
               value={receita.calorias}
               onChange={(e) => atualizarCampo('calorias', e.target.value)}
               placeholder="Ex: 350 ou N/A"
             />
           </div>
         </div>
          <div>
             <label htmlFor="tags-input" className="block mb-2 font-medium text-sm">Tags</label> {/* Changed htmlFor to match input inside TagInput if needed, or remove if label clicks container */}
             <TagInput
                 // id="tags" removed - TagInput doesn't accept id prop directly
                 tags={receita.tags}
                 onChange={(tags) => atualizarCampo('tags', tags)}
                 suggestions={tagsSugeridas}
                placeholder="Adicione tags (ex: Vegano, Rápido)"
            />
         </div>
       </section>

      {/* Image Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Imagem da Receita</h2>
        <div>
          <label htmlFor="imagem" className="block mb-2 font-medium text-sm">Carregar Imagem</label>
          <Input
            id="imagem"
            type="file"
            accept="image/*"
            onChange={handleImagemChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {previewImagem && (
            <div className="mt-4 relative h-48 w-full max-w-sm border rounded overflow-hidden">
              <img
                src={previewImagem}
                alt="Preview da Receita"
                className="w-full h-full object-cover"
              />
               <Button
                  type="button"
                  onClick={() => { setPreviewImagem(null); atualizarCampo('imagem', ''); }}
                  variant="danger"
                  size="sm"
                  className="absolute top-2 right-2 !p-1"
                  aria-label="Remover imagem"
               >
                 X
               </Button>
            </div>
          )}
        </div>
      </section>

      {/* Ingredients Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Ingredientes*</h2>
          <Button type="button" onClick={adicionarIngrediente} size="sm" variant="outline">+ Adicionar Ingrediente</Button>
        </div>
        <div className="space-y-3">
          {receita.ingredientes.map((ingrediente, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                 <Input
                   type="text" // Allow fractions or ranges like '1/2' or '1-2'
                   value={ingrediente.quantidade}
                   onChange={(e) => atualizarIngrediente(index, 'quantidade', e.target.value)}
                   placeholder="Qtd."
                   className="w-full sm:w-20"
                   aria-label={`Quantidade do ingrediente ${index + 1}`}
                 />
                 <Select
                   options={opcoesUnidades}
                   value={ingrediente.unidade}
                   onChange={(e) => atualizarIngrediente(index, 'unidade', e.target.value)}
                   className="w-full sm:w-32"
                   aria-label={`Unidade do ingrediente ${index + 1}`}
                 />
                 <Input
                   value={ingrediente.nome}
                   onChange={(e) => atualizarIngrediente(index, 'nome', e.target.value)}
                   placeholder="Nome do Ingrediente"
                   className="flex-1 min-w-[150px] col-span-3 sm:col-span-1" // Span across on mobile
                   required
                   aria-label={`Nome do ingrediente ${index + 1}`}
                 />
              </div>
              <Button
                type="button"
                onClick={() => removerIngrediente(index)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 ml-auto mt-2 sm:mt-0"
                disabled={receita.ingredientes.length <= 1}
                aria-label={`Remover ingrediente ${index + 1}`}
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Steps Section */}
      <section className="space-y-4">
         <div className="flex justify-between items-center mb-2">
           <h2 className="text-xl font-semibold">Modo de Preparo*</h2>
           <Button type="button" onClick={adicionarPasso} size="sm" variant="outline">+ Adicionar Passo</Button>
         </div>
         <div className="space-y-4">
           {receita.passos.map((passo, index) => (
             <div key={index} className="flex items-start gap-3">
               <span className="mt-2 font-semibold text-gray-500">{index + 1}.</span>
               <Textarea
                 value={passo}
                 onChange={(e) => atualizarPasso(index, e.target.value)}
                 placeholder={`Descreva o passo ${index + 1}`}
                 className="flex-1"
                 rows={3}
                 required
                 aria-label={`Passo ${index + 1} do modo de preparo`}
               />
               <Button
                 type="button"
                 onClick={() => removerPasso(index)}
                 variant="ghost"
                 size="sm"
                 className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 mt-1"
                 disabled={receita.passos.length <= 1}
                 aria-label={`Remover passo ${index + 1}`}
               >
                 Remover
               </Button>
             </div>
           ))}
         </div>
       </section>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" onClick={handleCancel} variant="outline">Cancelar</Button>
        <Button type="submit" color="primary">
          {editando ? 'Atualizar Receita' : 'Salvar Nova Receita'}
        </Button>
      </div>
    </form>
  );
}
