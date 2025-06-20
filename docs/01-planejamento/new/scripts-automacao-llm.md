# 🤖 Scripts e Automações para LLMs - Refatoração StayFocus

## 📋 Visão Geral

Este documento complementa o `guia-llm-refatoracao.md` fornecendo scripts, comandos e automações para acelerar o processo de refatoração dos módulos.

## 🚀 Scripts de Análise Rápida

### 1. Análise de Módulo
```bash
#!/bin/bash
# scripts/analisar-modulo.sh

MODULO=$1
if [ -z "$MODULO" ]; then
  echo "Uso: ./analisar-modulo.sh [nome-do-modulo]"
  exit 1
fi

echo "🔍 Analisando módulo: $MODULO"
echo "================================"

echo "📁 Estrutura de arquivos:"
find app/components/$MODULO -type f -name "*.tsx" -o -name "*.ts" 2>/dev/null | head -10

echo -e "\n📦 Store Zustand:"
find app/stores -name "*${MODULO}*" 2>/dev/null

echo -e "\n🔌 APIs existentes:"
find pages/api -name "*${MODULO}*" -type d 2>/dev/null
find pages/api -name "*${MODULO}*" -type f 2>/dev/null

echo -e "\n🧪 Testes existentes:"
find . -name "*${MODULO}*.test.*" -o -name "*${MODULO}*.spec.*" 2>/dev/null

echo -e "\n📊 Estatísticas:"
echo "Componentes: $(find app/components/$MODULO -name "*.tsx" 2>/dev/null | wc -l)"
echo "Hooks: $(find app/hooks -name "*${MODULO}*" 2>/dev/null | wc -l)"
echo "Testes: $(find . -name "*${MODULO}*.test.*" 2>/dev/null | wc -l)"
```

### 2. Validação de APIs
```bash
#!/bin/bash
# scripts/testar-apis.sh

MODULO=$1
USER_ID="550e8400-e29b-41d4-a716-446655440000"
BASE_URL="http://localhost:3000"

if [ -z "$MODULO" ]; then
  echo "Uso: ./testar-apis.sh [nome-do-modulo]"
  exit 1
fi

echo "🧪 Testando APIs do módulo: $MODULO"
echo "=================================="

# Testar GET
echo "📥 Testando GET /$MODULO"
curl -s -X GET "$BASE_URL/api/$MODULO?user_id=$USER_ID" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ Erro no GET"

# Testar POST (exemplo genérico)
echo -e "\n📤 Testando POST /$MODULO"
curl -s -X POST "$BASE_URL/api/$MODULO" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$USER_ID\",\"titulo\":\"Teste API $MODULO\"}" | jq '.' || echo "❌ Erro no POST"

echo -e "\n✅ Testes de API concluídos"
```

### 3. Gerador de Templates
```bash
#!/bin/bash
# scripts/gerar-template.sh

MODULO=$1
ENTIDADE=$2

if [ -z "$MODULO" ] || [ -z "$ENTIDADE" ]; then
  echo "Uso: ./gerar-template.sh [modulo] [entidade]"
  echo "Exemplo: ./gerar-template.sh sessoes Sessao"
  exit 1
fi

MODULO_LOWER=$(echo $MODULO | tr '[:upper:]' '[:lower:]')
ENTIDADE_LOWER=$(echo $ENTIDADE | tr '[:upper:]' '[:lower:]')

echo "🏗️ Gerando templates para: $MODULO ($ENTIDADE)"
echo "============================================="

# Criar estrutura de pastas
mkdir -p "app/components/$MODULO_LOWER"
mkdir -p "app/hooks"
mkdir -p "pages/api/$MODULO_LOWER"

# Gerar API Route
cat > "pages/api/$MODULO_LOWER/index.ts" << EOF
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const Create${ENTIDADE}Schema = z.object({
  user_id: z.string().uuid(),
  // TODO: Adicionar campos específicos
})

const QuerySchema = z.object({
  user_id: z.string().uuid(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'POST':
        return await handlePost(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error(\`Error in \${req.method} /api/$MODULO_LOWER:\`, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const query = QuerySchema.parse(req.query)
  
  const { data, error, count } = await supabase
    .from('$MODULO_LOWER')
    .select('*', { count: 'exact' })
    .eq('user_id', query.user_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching $MODULO_LOWER:', error)
    return res.status(500).json({ error: 'Failed to fetch $MODULO_LOWER' })
  }

  return res.status(200).json({ data, count })
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const body = Create${ENTIDADE}Schema.parse(req.body)
  
  const { data, error } = await supabase
    .from('$MODULO_LOWER')
    .insert([{
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating $ENTIDADE_LOWER:', error)
    return res.status(500).json({ error: 'Failed to create $ENTIDADE_LOWER' })
  }

  return res.status(201).json({ data })
}
EOF

# Gerar Hook
cat > "app/hooks/use${ENTIDADE}s.ts" << EOF
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Tipos
interface $ENTIDADE {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  // TODO: Adicionar campos específicos
}

interface Create${ENTIDADE}Data {
  user_id: string
  // TODO: Adicionar campos obrigatórios
}

interface Update${ENTIDADE}Data {
  // TODO: Adicionar campos opcionais
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

// Funções de API
const ${MODULO_LOWER}Api = {
  get${ENTIDADE}s: async (userId: string): Promise<{ data: $ENTIDADE[], count: number }> => {
    const params = new URLSearchParams({ user_id: userId })
    const response = await fetch(\`\${API_BASE_URL}/api/$MODULO_LOWER?\${params}\`)
    if (!response.ok) throw new Error(\`Failed to fetch $MODULO_LOWER: \${response.statusText}\`)
    return response.json()
  },

  create$ENTIDADE: async (data: Create${ENTIDADE}Data): Promise<{ data: $ENTIDADE }> => {
    const response = await fetch(\`\${API_BASE_URL}/api/$MODULO_LOWER\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(\`Failed to create $ENTIDADE_LOWER: \${response.statusText}\`)
    return response.json()
  },
}

// Hooks React Query
export const useGet${ENTIDADE}s = (userId: string) => {
  return useQuery({
    queryKey: ['$MODULO_LOWER', userId],
    queryFn: () => ${MODULO_LOWER}Api.get${ENTIDADE}s(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export const useCreate$ENTIDADE = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ${MODULO_LOWER}Api.create$ENTIDADE,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['$MODULO_LOWER', variables.user_id] })
    },
  })
}

// Hook para user_id (temporário)
export const useUserId = () => {
  return '550e8400-e29b-41d4-a716-446655440000'
}

// Exportar tipos
export type { $ENTIDADE, Create${ENTIDADE}Data, Update${ENTIDADE}Data }
EOF

echo "✅ Templates gerados:"
echo "  📄 pages/api/$MODULO_LOWER/index.ts"
echo "  📄 app/hooks/use${ENTIDADE}s.ts"
echo ""
echo "🔧 Próximos passos:"
echo "  1. Editar os schemas de validação"
echo "  2. Adicionar campos específicos aos tipos"
echo "  3. Implementar componentes React"
echo "  4. Criar testes"
```

## 🧪 Scripts de Teste

### 1. Teste Completo de Módulo
```bash
#!/bin/bash
# scripts/testar-modulo-completo.sh

MODULO=$1
if [ -z "$MODULO" ]; then
  echo "Uso: ./testar-modulo-completo.sh [nome-do-modulo]"
  exit 1
fi

echo "🧪 Teste completo do módulo: $MODULO"
echo "===================================="

# 1. Compilação
echo "🔨 Verificando compilação..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Compilação OK"
else
  echo "❌ Erro na compilação"
  npm run build
  exit 1
fi

# 2. Testes unitários
echo "🧪 Executando testes unitários..."
npm test -- --testPathPattern=$MODULO --passWithNoTests
if [ $? -eq 0 ]; then
  echo "✅ Testes unitários OK"
else
  echo "❌ Falhas nos testes unitários"
fi

# 3. Type checking
echo "🔍 Verificando tipos TypeScript..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
  echo "✅ Types OK"
else
  echo "❌ Erros de tipo"
fi

# 4. Lint
echo "🧹 Verificando lint..."
npm run lint -- --quiet
if [ $? -eq 0 ]; then
  echo "✅ Lint OK"
else
  echo "⚠️ Avisos de lint"
fi

echo "✅ Teste completo finalizado"
```

### 2. Monitoramento de Performance
```bash
#!/bin/bash
# scripts/monitorar-performance.sh

echo "📊 Monitorando performance da aplicação"
echo "======================================="

# Iniciar servidor em background
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!

# Aguardar servidor inicializar
sleep 5

# Testar tempo de resposta das APIs
echo "⏱️ Testando tempo de resposta:"
for endpoint in "hiperfocos" "tarefas" "sessoes"; do
  if [ -d "pages/api/$endpoint" ]; then
    time_result=$(curl -w "%{time_total}" -s -o /dev/null "http://localhost:3000/api/$endpoint?user_id=550e8400-e29b-41d4-a716-446655440000")
    echo "  $endpoint: ${time_result}s"
  fi
done

# Testar tamanho do bundle
echo -e "\n📦 Analisando bundle:"
npm run build > /dev/null 2>&1
du -sh .next/static/chunks/*.js | head -5

# Finalizar servidor
kill $SERVER_PID

echo "✅ Monitoramento concluído"
```

## 🔧 Utilitários de Desenvolvimento

### 1. Limpeza de Cache
```bash
#!/bin/bash
# scripts/limpar-cache.sh

echo "🧹 Limpando caches de desenvolvimento"
echo "===================================="

# Next.js
rm -rf .next
echo "✅ Cache Next.js limpo"

# Node modules (opcional)
read -p "Limpar node_modules? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm -rf node_modules
  npm install
  echo "✅ Node modules reinstalados"
fi

# Logs
rm -f *.log
echo "✅ Logs limpos"

echo "✅ Limpeza concluída"
```

### 2. Backup Antes da Refatoração
```bash
#!/bin/bash
# scripts/backup-modulo.sh

MODULO=$1
if [ -z "$MODULO" ]; then
  echo "Uso: ./backup-modulo.sh [nome-do-modulo]"
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/${MODULO}_${TIMESTAMP}"

echo "💾 Criando backup do módulo: $MODULO"
echo "===================================="

mkdir -p "$BACKUP_DIR"

# Backup de componentes
if [ -d "app/components/$MODULO" ]; then
  cp -r "app/components/$MODULO" "$BACKUP_DIR/components"
  echo "✅ Componentes salvos"
fi

# Backup de stores
find app/stores -name "*${MODULO}*" -exec cp {} "$BACKUP_DIR/" \; 2>/dev/null
echo "✅ Stores salvos"

# Backup de hooks
find app/hooks -name "*${MODULO}*" -exec cp {} "$BACKUP_DIR/" \; 2>/dev/null
echo "✅ Hooks salvos"

# Backup de APIs
if [ -d "pages/api/$MODULO" ]; then
  cp -r "pages/api/$MODULO" "$BACKUP_DIR/api"
  echo "✅ APIs salvas"
fi

# Backup de testes
find . -name "*${MODULO}*.test.*" -exec cp {} "$BACKUP_DIR/" \; 2>/dev/null
echo "✅ Testes salvos"

echo "✅ Backup criado em: $BACKUP_DIR"
```

## 📋 Comandos Rápidos para LLMs

### Análise Inicial
```bash
# Analisar estrutura do projeto
find app/components -type d -maxdepth 1
find app/stores -name "*.ts" | head -10
find pages/api -type d -maxdepth 1

# Verificar dependências
grep -E "(react-query|tanstack)" package.json
grep -E "supabase" package.json
```

### Durante Desenvolvimento
```bash
# Iniciar servidor com logs
npm run dev | tee dev.log

# Testar API específica
curl -X GET "http://localhost:3000/api/[modulo]?user_id=550e8400-e29b-41d4-a716-446655440000" | jq

# Verificar erros de compilação
npm run build 2>&1 | grep -E "(error|Error)"
```

### Validação Final
```bash
# Executar todos os testes
npm test -- --coverage --watchAll=false

# Verificar performance
npm run build && npm run start &
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:3000

# Verificar bundle size
npm run build && du -sh .next/static/chunks/*.js
```

---

**Última atualização**: Junho 2025  
**Versão**: 1.0  
**Uso**: Complementar ao guia-llm-refatoracao.md
