# Guia de Implementação: Seção de Receitas na Página /alimentacao

## 1. Estrutura de Pastas e Arquivos

Crie a seguinte estrutura sugerida:

```
/components
  - ListaReceitas.tsx
  - FiltroCategorias.tsx
  - Pesquisa.tsx
  - Button.tsx
  - Tag.tsx
  - Input.tsx
  - Textarea.tsx
  - Select.tsx
  - TagInput.tsx
  - Checkbox.tsx
/pages ou /app
  /receitas
    - index.tsx (ou page.tsx)
    - [id].tsx (ou [id]/page.tsx)
    - adicionar.tsx (ou adicionar/page.tsx)
    - lista-compras.tsx (ou lista-compras/page.tsx)
/stores
  - receitasStore.ts
  - alimentacaoStore.ts
```

## 2. Store de Receitas

Implemente o arquivo `stores/receitasStore.ts` conforme o exemplo do documento de proposta. Isso garante o gerenciamento de receitas, favoritos e integração com o localStorage.

## 3. Componentes de UI

Implemente os componentes principais:
- `ReceitasPage` (listagem e filtro)
- `DetalhesReceita` (visualização detalhada)
- `AdicionarReceita` (formulário de criação/edição)
- `ListaCompras` (lista de compras baseada nas receitas)

Você pode copiar e colar os exemplos do documento de proposta, adaptando para o seu padrão de projeto (Next.js App Router ou Pages Router).

## 4. Integração com Alimentação

No arquivo da página `/alimentacao`, adicione um link ou botão para acessar a seção de receitas. Exemplo:

```tsx
// Em /pages/alimentacao/index.tsx ou /app/alimentacao/page.tsx
import Link from 'next/link';

export default function AlimentacaoPage() {
  return (
    <div>
      <h1>Alimentação</h1>
      {/* ...outros conteúdos... */}
      <Link href="/receitas">
        <button className="bg-primary-500 text-white px-4 py-2 rounded">
          Ir para Receitas
        </button>
      </Link>
    </div>
  );
}
```

## 5. Rotas

Garanta que as rotas estejam configuradas conforme o seu Next.js (App Router ou Pages Router). Isso permite acessar `/receitas`, `/receitas/adicionar`, `/receitas/[id]` e `/receitas/lista-compras`.

## 6. Sidebar/Navegação

Adicione o link para receitas no seu Sidebar, conforme sugerido:

```tsx
<Link href="/receitas">
  <Book /> Receitas
</Link>
```

## 7. Testes e Ajustes

- Teste a adição, edição, remoção e visualização de receitas.
- Teste a integração com o planejador de refeições.
- Teste a lista de compras.
- Ajuste responsividade e UX conforme necessário.

---

## Dúvidas Frequentes

- **Precisa de backend?** Não obrigatoriamente, pois o Zustand com persistência já salva no localStorage. Mas para multiusuários ou backup, um backend seria ideal.
- **Como tratar imagens?** O exemplo usa `URL.createObjectURL`, mas para produção, use um serviço de upload (Cloudinary, S3, etc).
- **Como integrar com outras áreas?** Use os IDs das receitas para relacionar com refeições planejadas, finanças, etc.

---
