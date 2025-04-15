## Proposta para uma Seção de Receitas dentro da Pagina Alimentação (`/receitas`)

### Funcionalidades Principais:

1. **Catálogo de Receitas**
   - Visualização em grid/lista de receitas salvas
   - Filtragem por categorias (café da manhã, almoço, jantar, lanches, etc.)
   - Pesquisa por ingredientes ou nome

2. **Detalhes da Receita**
   - Ingredientes com quantidades
   - Instruções passo a passo
   - Tempo de preparo e porções
   - Informações nutricionais
   - Tags para categorização (sem glúten, vegano, etc.)

3. **Adição/Edição de Receitas**
   - Formulário para adicionar novas receitas
   - Upload de imagens
   - Editor para formatação do texto

4. **Integração com Alimentação**
   - Adicionar receita ao planejador de refeições
   - Registrar refeição baseada em receita

5. **Funcionalidades Extra**
   - Lista de compras baseada em receitas selecionadas
   - Ajuste automático de quantidades baseado no número de porções
   - Favoritar receitas

Possivel estrutura de código e componentes para essa seção:

### Componentes Chave:

#### `ReceitasPage.tsx` (Página principal)
```tsx
import { useState } from 'react';
import { ListaReceitas } from './ListaReceitas';
import { FiltroCategorias } from './FiltroCategorias';
import { Pesquisa } from '../components/Pesquisa';
import { useReceitasStore } from '../stores/receitasStore';

export default function ReceitasPage() {
  const { receitas } = useReceitasStore();
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [termoPesquisa, setTermoPesquisa] = useState('');
  
  const receitasFiltradas = receitas
    .filter(receita => filtroCategoria === 'todas' || receita.categorias.includes(filtroCategoria))
    .filter(receita => 
      receita.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      receita.ingredientes.some(ing => ing.nome.toLowerCase().includes(termoPesquisa.toLowerCase()))
    );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Minhas Receitas</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Pesquisa 
          placeholder="Buscar por nome ou ingrediente" 
          valor={termoPesquisa} 
          aoMudar={setTermoPesquisa} 
        />
        <FiltroCategorias 
          categoriaAtual={filtroCategoria} 
          aoSelecionar={setFiltroCategoria} 
        />
      </div>
      
      <ListaReceitas receitas={receitasFiltradas} />
    </div>
  );
}
```

#### `DetalhesReceita.tsx` (Visualização detalhada)
```tsx
import { useState } from 'react';
import { useReceitasStore } from '../stores/receitasStore';
import { useAlimentacaoStore } from '../stores/alimentacaoStore';
import { Button } from '../components/Button';
import { Tag } from '../components/Tag';

export function DetalhesReceita({ id }) {
  const { obterReceitaPorId } = useReceitasStore();
  const { adicionarAoPlanejador } = useAlimentacaoStore();
  const [porcoes, setPorcoes] = useState(1);
  
  const receita = obterReceitaPorId(id);
  
  if (!receita) return <p>Receita não encontrada</p>;
  
  const ajustarQuantidade = (quantidade) => {
    return (quantidade * porcoes / receita.porcoes).toFixed(1);
  };
  
  const adicionarAoPlanejamento = () => {
    adicionarAoPlanejador({
      descricao: receita.nome,
      horario: "",
      receitaId: receita.id
    });
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="relative h-64 rounded-lg overflow-hidden mb-6">
        {receita.imagem ? (
          <img 
            src={receita.imagem} 
            alt={receita.nome} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span>Sem imagem</span>
          </div>
        )}
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{receita.nome}</h1>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {receita.tags.map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-primary-50 p-3 rounded-lg text-center">
          <p className="text-sm">Tempo de Preparo</p>
          <p className="font-bold">{receita.tempoPreparo} min</p>
        </div>
        <div className="bg-primary-50 p-3 rounded-lg text-center">
          <p className="text-sm">Porções</p>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPorcoes(Math.max(1, porcoes - 1))}>-</button>
            <p className="font-bold">{porcoes}</p>
            <button onClick={() => setPorcoes(porcoes + 1)}>+</button>
          </div>
        </div>
        <div className="bg-primary-50 p-3 rounded-lg text-center">
          <p className="text-sm">Calorias (por porção)</p>
          <p className="font-bold">{receita.calorias || "Não informado"}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4">Ingredientes</h2>
          <ul className="space-y-2">
            {receita.ingredientes.map((ing, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="font-medium">{ajustarQuantidade(ing.quantidade)} {ing.unidade}</span>
                <span>{ing.nome}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6">
            <Button onClick={adicionarAoPlanejamento} color="primary">
              Adicionar ao Planejador
            </Button>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Modo de Preparo</h2>
          <ol className="space-y-4 list-decimal pl-4">
            {receita.passos.map((passo, index) => (
              <li key={index} className="pl-2">
                {passo}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
```

#### `AdicionarReceita.tsx` (Formulário de adição/edição)
```tsx
import { useState } from 'react';
import { useReceitasStore } from '../stores/receitasStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Select } from '../components/Select';
import { TagInput } from '../components/TagInput';

export function AdicionarReceita({ receitaParaEditar, aoFinalizar }) {
  const { adicionarReceita, atualizarReceita } = useReceitasStore();
  const editando = !!receitaParaEditar;
  
  const [receita, setReceita] = useState({
    id: receitaParaEditar?.id || Date.now().toString(),
    nome: receitaParaEditar?.nome || '',
    descricao: receitaParaEditar?.descricao || '',
    categorias: receitaParaEditar?.categorias || [],
    tags: receitaParaEditar?.tags || [],
    tempoPreparo: receitaParaEditar?.tempoPreparo || 30,
    porcoes: receitaParaEditar?.porcoes || 2,
    calorias: receitaParaEditar?.calorias || '',
    imagem: receitaParaEditar?.imagem || '',
    ingredientes: receitaParaEditar?.ingredientes || [{ nome: '', quantidade: 1, unidade: 'g' }],
    passos: receitaParaEditar?.passos || ['']
  });
  
  const opcoesUnidades = [
    { value: 'g', label: 'gramas (g)' },
    { value: 'ml', label: 'mililitros (ml)' },
    { value: 'unidade', label: 'unidade(s)' },
    { value: 'colher_sopa', label: 'colher(es) de sopa' },
    { value: 'colher_cha', label: 'colher(es) de chá' },
    { value: 'xicara', label: 'xícara(s)' },
    { value: 'a_gosto', label: 'a gosto' },
  ];
  
  const categorias = [
    { value: 'cafe_manha', label: 'Café da Manhã' },
    { value: 'almoco', label: 'Almoço' },
    { value: 'jantar', label: 'Jantar' },
    { value: 'lanche', label: 'Lanche' },
    { value: 'sobremesa', label: 'Sobremesa' },
    { value: 'bebida', label: 'Bebida' }
  ];
  
  const atualizarCampo = (campo, valor) => {
    setReceita({ ...receita, [campo]: valor });
  };
  
  const atualizarIngrediente = (index, campo, valor) => {
    const novosIngredientes = [...receita.ingredientes];
    novosIngredientes[index] = { ...novosIngredientes[index], [campo]: valor };
    setReceita({ ...receita, ingredientes: novosIngredientes });
  };
  
  const adicionarIngrediente = () => {
    setReceita({
      ...receita,
      ingredientes: [...receita.ingredientes, { nome: '', quantidade: 1, unidade: 'g' }]
    });
  };
  
  const removerIngrediente = (index) => {
    const novosIngredientes = [...receita.ingredientes];
    novosIngredientes.splice(index, 1);
    setReceita({ ...receita, ingredientes: novosIngredientes });
  };
  
  const atualizarPasso = (index, valor) => {
    const novosPassos = [...receita.passos];
    novosPassos[index] = valor;
    setReceita({ ...receita, passos: novosPassos });
  };
  
  const adicionarPasso = () => {
    setReceita({
      ...receita,
      passos: [...receita.passos, '']
    });
  };
  
  const removerPasso = (index) => {
    const novosPassos = [...receita.passos];
    novosPassos.splice(index, 1);
    setReceita({ ...receita, passos: novosPassos });
  };
  
  const salvarReceita = () => {
    // Validação básica
    if (!receita.nome || receita.ingredientes.some(ing => !ing.nome) || receita.passos.some(p => !p)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    if (editando) {
      atualizarReceita(receita);
    } else {
      adicionarReceita(receita);
    }
    
    aoFinalizar && aoFinalizar(receita);
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {editando ? 'Editar Receita' : 'Nova Receita'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block mb-2 font-medium">Nome da Receita*</label>
          <Input
            value={receita.nome}
            onChange={(e) => atualizarCampo('nome', e.target.value)}
            placeholder="Ex: Panquecas de Banana"
            required
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Categorias</label>
          <Select
            options={categorias}
            value={receita.categorias}
            onChange={(value) => atualizarCampo('categorias', value)}
            multiple
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 font-medium">Descrição Breve</label>
        <Textarea
          value={receita.descricao}
          onChange={(e) => atualizarCampo('descricao', e.target.value)}
          placeholder="Uma breve descrição sobre a receita..."
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block mb-2 font-medium">Tempo de Preparo (min)*</label>
          <Input
            type="number"
            value={receita.tempoPreparo}
            onChange={(e) => atualizarCampo('tempoPreparo', parseInt(e.target.value))}
            min={1}
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Porções*</label>
          <Input
            type="number"
            value={receita.porcoes}
            onChange={(e) => atualizarCampo('porcoes', parseInt(e.target.value))}
            min={1}
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Calorias (por porção)</label>
          <Input
            type="number"
            value={receita.calorias}
            onChange={(e) => atualizarCampo('calorias', e.target.value)}
            min={0}
            placeholder="Opcional"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 font-medium">Tags</label>
        <TagInput
          tags={receita.tags}
          onChange={(tags) => atualizarCampo('tags', tags)}
          suggestions={['Sem Glúten', 'Vegano', 'Vegetariano', 'Low Carb', 'Rápido', 'Saudável']}
        />
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 font-medium">Imagem</label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            // Aqui você implementaria o upload da imagem
            // Por simplicidade, simulamos um URL da imagem
            if (e.target.files?.[0]) {
              const fileURL = URL.createObjectURL(e.target.files[0]);
              atualizarCampo('imagem', fileURL);
            }
          }}
        />
        {receita.imagem && (
          <div className="mt-2 relative h-40 w-40">
            <img 
              src={receita.imagem} 
              alt="Preview" 
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Ingredientes*</h2>
          <Button onClick={adicionarIngrediente} size="sm">+ Adicionar</Button>
        </div>
        
        {receita.ingredientes.map((ingrediente, index) => (
          <div key={index} className="flex items-center gap-3 mb-2">
            <Input
              type="number"
              value={ingrediente.quantidade}
              onChange={(e) => atualizarIngrediente(index, 'quantidade', parseFloat(e.target.value))}
              min={0}
              step={0.1}
              className="w-24"
            />
            
            <Select
              options={opcoesUnidades}
              value={ingrediente.unidade}
              onChange={(value) => atualizarIngrediente(index, 'unidade', value)}
              className="w-40"
            />
            
            <Input
              value={ingrediente.nome}
              onChange={(e) => atualizarIngrediente(index, 'nome', e.target.value)}
              placeholder="Ingrediente"
              className="flex-1"
            />
            
            <Button 
              onClick={() => removerIngrediente(index)} 
              variant="ghost" 
              size="sm"
              disabled={receita.ingredientes.length <= 1}
            >
              X
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Modo de Preparo*</h2>
          <Button onClick={adicionarPasso} size="sm">+ Adicionar</Button>
        </div>
        
        {receita.passos.map((passo, index) => (
          <div key={index} className="flex items-start gap-3 mb-4">
            <div className="mt-2 font-medium">{index + 1}.</div>
            <Textarea
              value={passo}
              onChange={(e) => atualizarPasso(index, e.target.value)}
              placeholder={`Passo ${index + 1}`}
              className="flex-1"
              rows={2}
            />
            
            <Button 
              onClick={() => removerPasso(index)} 
              variant="ghost" 
              size="sm"
              disabled={receita.passos.length <= 1}
            >
              X
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end gap-4">
        <Button onClick={() => aoFinalizar?.()} variant="outline">Cancelar</Button>
        <Button onClick={salvarReceita} color="primary">Salvar Receita</Button>
      </div>
    </div>
  );
}
```

### Store para Gerenciamento de Estado

Vamos criar uma store Zustand para armazenar e gerenciar as receitas:

```tsx
// stores/receitasStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface Ingrediente {
  nome: string;
  quantidade: number;
  unidade: string;
}

interface Receita {
  id: string;
  nome: string;
  descricao: string;
  categorias: string[];
  tags: string[];
  tempoPreparo: number;
  porcoes: number;
  calorias: string;
  imagem: string;
  ingredientes: Ingrediente[];
  passos: string[];
}

interface ReceitasStore {
  receitas: Receita[];
  adicionarReceita: (receita: Receita) => void;
  atualizarReceita: (receita: Receita) => void;
  removerReceita: (id: string) => void;
  obterReceitaPorId: (id: string) => Receita | undefined;
  favoritos: string[];
  alternarFavorito: (id: string) => void;
}

export const useReceitasStore = create<ReceitasStore>()(
  persist(
    (set, get) => ({
      receitas: [],
      adicionarReceita: (receita) => 
        set((state) => ({ receitas: [...state.receitas, receita] })),
      atualizarReceita: (receita) =>
        set((state) => ({
          receitas: state.receitas.map((r) => 
            r.id === receita.id ? receita : r
          ),
        })),
      removerReceita: (id) =>
        set((state) => ({
          receitas: state.receitas.filter((r) => r.id !== id),
        })),
      obterReceitaPorId: (id) => {
        return get().receitas.find((r) => r.id === id);
      },
      favoritos: [],
      alternarFavorito: (id) => 
        set((state) => {
          if (state.favoritos.includes(id)) {
            return { favoritos: state.favoritos.filter((fav) => fav !== id) };
          } else {
            return { favoritos: [...state.favoritos, id] };
          }
        }),
    }),
    {
      name: 'receitas-storage',
    }
  )
);
```

### Integração com a Alimentação

Para integrar a funcionalidade de receitas com a seção de alimentação existente, podemos modificar o `PlanejadorRefeicoes.tsx` para suportar a adição de receitas:

```tsx
// Modificação para o PlanejadorRefeicoes.tsx
import { useState, useEffect } from 'react';
import { useAlimentacaoStore } from '../stores/alimentacaoStore';
import { useReceitasStore } from '../stores/receitasStore';

export function PlanejadorRefeicoes() {
  const { refeicoesPlanejadas, adicionarRefeicao } = useAlimentacaoStore();
  const { receitas } = useReceitasStore();
  const [novaRefeicao, setNovaRefeicao] = useState({
    horario: "",
    descricao: "",
    receitaId: ""
  });
  
  const handleAdicionarRefeicao = () => {
    adicionarRefeicao(
      novaRefeicao.horario, 
      novaRefeicao.descricao, 
      novaRefeicao.receitaId
    );
    
    // Resetar o formulário
    setNovaRefeicao({
      horario: "",
      descricao: "",
      receitaId: ""
    });
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Planejador de Refeições</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block mb-1">Horário</label>
          <input
            type="time"
            value={novaRefeicao.horario}
            onChange={(e) => setNovaRefeicao({...novaRefeicao, horario: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Descrição</label>
          <input
            type="text"
            value={novaRefeicao.descricao}
            onChange={(e) => setNovaRefeicao({...novaRefeicao, descricao: e.target.value})}
            placeholder="Ex: Café da manhã"
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Receita (opcional)</label>
          <select
            value={novaRefeicao.receitaId}
            onChange={(e) => setNovaRefeicao({...novaRefeicao, receitaId: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione uma receita</option>
            {receitas.map((receita) => (
              <option key={receita.id} value={receita.id}>
                {receita.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <button
        onClick={handleAdicionarRefeicao}
        disabled={!novaRefeicao.horario || !novaRefeicao.descricao}
        className="bg-primary-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Adicionar Refeição
      </button>
      
      <div className="mt-6">
        <h3 className="font-medium mb-2">Refeições Planejadas</h3>
        {refeicoesPlanejadas.length === 0 ? (
          <p className="text-gray-500">Nenhuma refeição planejada</p>
        ) : (
          <ul className="space-y-2">
            {refeicoesPlanejadas.map((refeicao, index) => {
              const receitaAssociada = refeicao.receitaId 
                ? receitas.find(r => r.id === refeicao.receitaId) 
                : null;
                
              return (
                <li key={index} className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">{refeicao.horario} - {refeicao.descricao}</div>
                  {receitaAssociada && (
                    <div className="text-sm text-primary-600 mt-1">
                      Receita: {receitaAssociada.nome}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
```

### Componente de Lista de Compras (Funcionalidade Extra)

```tsx
import { useState } from 'react';
import { useReceitasStore } from '../stores/receitasStore';
import { Checkbox } from '../components/Checkbox';
import { Button } from '../components/Button';

export function ListaCompras() {
  const { receitas } = useReceitasStore();
  const [receitasSelecionadas, setReceitasSelecionadas] = useState<string[]>([]);
  const [porcoes, setPorcoes] = useState<Record<string, number>>({});
  const [itensComprados, setItensComprados] = useState<string[]>([]);
  
  // Inicializar porcões ao selecionar uma receita
  const toggleReceitaSelecionada = (id: string) => {
    if (receitasSelecionadas.includes(id)) {
      setReceitasSelecionadas(receitasSelecionadas.filter(rid => rid !== id));
      
      // Remover do objeto de porções
      const novasPorcoes = { ...porcoes };
      delete novasPorcoes[id];
      setPorcoes(novasPorcoes);
    } else {
      setReceitasSelecionadas([...receitasSelecionadas, id]);
      
      // Inicializar com o número de porções da receita
      const receita = receitas.find(r => r.id === id);
      if (receita) {
        setPorcoes({
          ...porcoes,
          [id]: receita.porcoes
        });
      }
    }
  };
  
  const atualizarPorcoes = (id: string, valor: number) => {
    setPorcoes({
      ...porcoes,
      [id]: Math.max(1, valor)
    });
  };
  
  // Agrupar ingredientes similares e calcular quantidades
  const gerarListaCompras = () => {
    const ingredientesAgrupados: Record<string, { 
      nome: string, 
      quantidadeTotal: number, 
      unidade: string 
    }> = {};
    
    // Para cada receita selecionada
    receitasSelecionadas.forEach(id => {
      const receita = receitas.find(r => r.id === id);
      if (!receita) return;
      
      const fatorMultiplicacao = porcoes[id] / receita.porcoes;
      
      // Para cada ingrediente na receita
      receita.ingredientes.forEach(ing => {
        // Criar uma chave única para o ingrediente (nome + unidade)
        const chave = `${ing.nome}_${ing.unidade}`;
        
        if (ingredientesAgrupados[chave]) {
          // Se já existe, adicionar à quantidade
          ingredientesAgrupados[chave].quantidadeTotal += ing.quantidade * fatorMultiplicacao;
        } else {
          // Se não existe, criar nova entrada
          ingredientesAgrupados[chave] = {
            nome: ing.nome,
            quantidadeTotal: ing.quantidade * fatorMultiplicacao,
            unidade: ing.unidade
          };
        }
      });
    });
    
    // Converter para array e ordenar
    return Object.values(ingredientesAgrupados)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  };
  
  const listaCompras = gerarListaCompras();
  
  const toggleItemComprado = (item: string) => {
    if (itensComprados.includes(item)) {
      setItensComprados(itensComprados.filter(i => i !== item));
    } else {
      setItensComprados([...itensComprados, item]);
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Lista de Compras</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Selecione as Receitas</h2>
        
        {receitas.length === 0 ? (
          <p
Vou continuar com o desenvolvimento do componente de Lista de Compras e finalizar a proposta para a seção de receitas.

```tsx
// Continuação do ListaCompras.tsx
        {receitas.length === 0 ? (
          <p className="text-gray-500">
            Nenhuma receita cadastrada. Adicione receitas para criar uma lista de compras.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {receitas.map(receita => (
              <div 
                key={receita.id} 
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  receitasSelecionadas.includes(receita.id) 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200'
                }`}
                onClick={() => toggleReceitaSelecionada(receita.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={receitasSelecionadas.includes(receita.id)}
                    onChange={() => {}} // Gerenciado pelo click no container
                  />
                  <div>
                    <p className="font-medium">{receita.nome}</p>
                    {receitasSelecionadas.includes(receita.id) && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm">Porções:</span>
                        <button 
                          className="w-6 h-6 bg-gray-200 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            atualizarPorcoes(receita.id, (porcoes[receita.id] || 1) - 1);
                          }}
                        >
                          -
                        </button>
                        <span>{porcoes[receita.id] || receita.porcoes}</span>
                        <button 
                          className="w-6 h-6 bg-gray-200 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            atualizarPorcoes(receita.id, (porcoes[receita.id] || 1) + 1);
                          }}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {receitasSelecionadas.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Lista de Compras</h2>
          
          {listaCompras.length === 0 ? (
            <p className="text-gray-500">
              Nenhum ingrediente encontrado nas receitas selecionadas.
            </p>
          ) : (
            <>
              <div className="mb-4 flex gap-2">
                <Button 
                  onClick={() => setItensComprados([])} 
                  variant="outline"
                >
                  Desmarcar Todos
                </Button>
                <Button 
                  onClick={() => setItensComprados(listaCompras.map(i => `${i.nome}_${i.unidade}`))} 
                  variant="outline"
                >
                  Marcar Todos
                </Button>
              </div>
              
              <ul className="space-y-2 mb-6">
                {listaCompras.map((item, index) => {
                  const itemKey = `${item.nome}_${item.unidade}`;
                  const isComprado = itensComprados.includes(itemKey);
                  
                  return (
                    <li 
                      key={index} 
                      className={`p-3 border rounded flex items-center gap-3 ${
                        isComprado ? 'bg-gray-100' : 'bg-white'
                      }`}
                    >
                      <Checkbox 
                        checked={isComprado}
                        onChange={() => toggleItemComprado(itemKey)}
                      />
                      <span className={isComprado ? 'line-through text-gray-500' : ''}>
                        <span className="font-medium">
                          {item.quantidadeTotal.toFixed(1)} {item.unidade}
                        </span>
                        {' '}{item.nome}
                      </span>
                    </li>
                  );
                })}
              </ul>
              
              <Button color="primary">
                Compartilhar Lista
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

### Navegação e Rotas

Para completar a implementação, precisamos adicionar as rotas e links de navegação:

#### Rotas no Next.js (pasta `app` ou `pages` dependendo da versão do Next.js)

Se estiver usando o App Router (Next.js >= 13):

```tsx
// app/receitas/page.tsx
export default function ReceitasPage() {
  return <ReceitasPage />;
}

// app/receitas/[id]/page.tsx
export default function ReceitaDetalhesPage({ params }) {
  return <DetalhesReceita id={params.id} />;
}

// app/receitas/adicionar/page.tsx
export default function AdicionarReceitaPage() {
  return <AdicionarReceita />;
}

// app/receitas/lista-compras/page.tsx
export default function ListaComprasPage() {
  return <ListaCompras />;
}
```

Ou, se estiver usando o Pages Router (versões anteriores do Next.js):

```tsx
// pages/receitas/index.tsx
export default function ReceitasPage() {
  return <ReceitasPage />;
}

// pages/receitas/[id].tsx
export default function ReceitaDetalhesPage({ id }) {
  return <DetalhesReceita id={id} />;
}

// pages/receitas/adicionar.tsx
export default function AdicionarReceitaPage() {
  return <AdicionarReceita />;
}

// pages/receitas/lista-compras.tsx
export default function ListaComprasPage() {
  return <ListaCompras />;
}
```

#### Atualização do Sidebar para incluir a seção de Receitas

```tsx
// Modificação no Sidebar.tsx
import { Utensils, Book, ShoppingCart } from 'lucide-react'; // Adicione os imports necessários

// No componente Sidebar, adicione:
<Link href="/alimentacao">
  <Utensils /> Alimentação
</Link>
<Link href="/receitas">
  <Book /> Receitas
</Link>
```

## Considerações de Implementação

### 1. Armazenamento de Dados
- Estou utilizando o Zustand com middleware `persist` para armazenar as receitas no localStorage.
- Para uma aplicação mais robusta, considere implementar um backend com banco de dados.

### 2. Manipulação de Imagens
- O upload de imagens no formulário foi implementado de forma simplificada com URL.createObjectURL.
- Para uma implementação completa, considere:
  - Compressão de imagens no cliente
  - Upload para um serviço de armazenamento (S3, Cloudinary, etc.)
  - Implementar cache e otimização de imagens

### 3. Responsividade
- Os componentes foram projetados com classes responsivas (grid-cols-1 md:grid-cols-3, etc.)
- Teste o layout em diferentes tamanhos de telas para garantir boa experiência móvel

### 4. Recursos Adicionais que Podem Ser Implementados
- **Sistema de avaliação** - Permitir classificar receitas com estrelas
- **Comentários** - Adicionar notas pessoais a cada receita
- **Calendário de refeições** - Visualização em formato de calendário para o planejamento
- **Importação/exportação** - Permitir importar receitas de outros sites ou exportar para formatos como PDF
- **Versões de receitas** - Salvar variações de uma mesma receita

