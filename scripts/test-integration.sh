#!/bin/bash

# Script para executar testes de integração com dados reais
# ATENÇÃO: Este script usa o banco de dados real do Supabase

echo "🧪 Executando Testes de Integração com Dados Reais"
echo "=================================================="

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Erro: Variáveis de ambiente do Supabase não configuradas"
    echo "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✅ Variáveis de ambiente configuradas"
echo "🔗 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"

# Definir ambiente de teste
export NODE_ENV=test

echo "🚀 Executando testes de integração..."

# Executar apenas os testes de integração com dados reais
npm test -- __tests__/integration/profile-real-data.test.tsx --run

echo "✅ Testes de integração concluídos"
