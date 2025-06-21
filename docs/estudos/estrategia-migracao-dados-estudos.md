# 🔄 ESTRATÉGIA DE MIGRAÇÃO DE DADOS - ESTUDOS E CONCURSOS

## 🎯 OBJETIVO

Migração segura e íntegra dos dados do localStorage para a nova arquitetura dual (Supabase + FastAPI), garantindo zero perda de dados e compatibilidade durante o período de transição.

---

## 📊 INVENTÁRIO DE DADOS ATUAL

### Chaves do localStorage Identificadas

| Chave | Estrutura | Tamanho Estimado | Criticidade |
|-------|-----------|------------------|-------------|
| `concursos-storage` | Array<Concurso> | ~50KB | 🔴 Crítica |
| `questoes-store` | Array<Questao> | ~100KB | 🔴 Crítica |
| `registro-estudos-storage` | Array<SessaoEstudo> | ~20KB | 🟡 Importante |
| `pomodoro-storage` | ConfiguracaoPomodoro | ~1KB | 🟡 Importante |
| `historico-simulados-storage` | Record<string, Historico> | ~30KB | 🟡 Importante |
| `simulado_personalizado_questoes` | Array<string> | ~5KB | 🟢 Opcional |
| `simulados_favoritos_{id}` | Array<Simulado> | ~10KB | 🟢 Opcional |

### Estruturas de Dados Detalhadas

```typescript
// Estrutura atual no localStorage
interface ConcursoLocalStorage {
  id: string
  titulo: string
  organizadora: string
  dataInscricao: string
  dataProva: string
  edital?: string
  status: string
  conteudoProgramatico: ConteudoProgramatico[]
}

// Estrutura alvo no banco
interface ConcursoDatabase {
  id: UUID
  user_id: UUID
  titulo: VARCHAR(500)
  organizadora: VARCHAR(255)
  data_inscricao: DATE
  data_prova: DATE
  edital: TEXT
  status: ENUM
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

---

## 🔄 ESTRATÉGIA DE MIGRAÇÃO

### Fase 1: Preparação (Semana 5, Dias 1-2)

#### 1.1 Backup Completo
```typescript
// Script de backup automático
const criarBackupCompleto = () => {
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    dados: {
      concursos: JSON.parse(localStorage.getItem('concursos-storage') || '[]'),
      questoes: JSON.parse(localStorage.getItem('questoes-store') || '[]'),
      sessoes: JSON.parse(localStorage.getItem('registro-estudos-storage') || '[]'),
      pomodoro: JSON.parse(localStorage.getItem('pomodoro-storage') || '{}'),
      historico: JSON.parse(localStorage.getItem('historico-simulados-storage') || '{}'),
      simuladosPersonalizados: Object.keys(localStorage)
        .filter(key => key.startsWith('simulado_personalizado_'))
        .reduce((acc, key) => {
          acc[key] = JSON.parse(localStorage.getItem(key) || '[]')
          return acc
        }, {} as Record<string, any>),
      simuladosFavoritos: Object.keys(localStorage)
        .filter(key => key.startsWith('simulados_favoritos_'))
        .reduce((acc, key) => {
          acc[key] = JSON.parse(localStorage.getItem(key) || '[]')
          return acc
        }, {} as Record<string, any>)
    }
  }
  
  // Salvar backup local
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup-estudos-${backup.timestamp}.json`
  a.click()
  
  return backup
}
```

#### 1.2 Validação de Integridade
```typescript
const validarIntegridadeDados = (dados: any) => {
  const relatorio = {
    concursos: {
      total: dados.concursos.length,
      validos: 0,
      erros: [] as string[]
    },
    questoes: {
      total: dados.questoes.length,
      validos: 0,
      erros: [] as string[]
    },
    relacionamentos: {
      questoesSemConcurso: 0,
      concursosSemQuestoes: 0
    }
  }

  // Validar concursos
  dados.concursos.forEach((concurso: any, index: number) => {
    if (!concurso.id || !concurso.titulo || !concurso.organizadora) {
      relatorio.concursos.erros.push(`Concurso ${index}: Campos obrigatórios faltando`)
    } else {
      relatorio.concursos.validos++
    }
  })

  // Validar questões
  dados.questoes.forEach((questao: any, index: number) => {
    if (!questao.id || !questao.enunciado || !questao.alternativas) {
      relatorio.questoes.erros.push(`Questão ${index}: Campos obrigatórios faltando`)
    } else if (!questao.alternativas.some((alt: any) => alt.correta)) {
      relatorio.questoes.erros.push(`Questão ${index}: Nenhuma alternativa correta`)
    } else {
      relatorio.questoes.validos++
    }
  })

  // Validar relacionamentos
  const concursoIds = new Set(dados.concursos.map((c: any) => c.id))
  dados.questoes.forEach((questao: any) => {
    if (questao.concursoId && !concursoIds.has(questao.concursoId)) {
      relatorio.relacionamentos.questoesSemConcurso++
    }
  })

  return relatorio
}
```

### Fase 2: Migração Incremental (Semana 5, Dias 3-4)

#### 2.1 Migração por Lotes
```typescript
const migrarDadosEmLotes = async (dados: any, tamanhoLote = 50) => {
  const resultados = {
    concursos: { migrados: 0, erros: 0 },
    questoes: { migrados: 0, erros: 0 },
    sessoes: { migrados: 0, erros: 0 }
  }

  // Migrar concursos primeiro (dependência)
  const lotesConcursos = chunk(dados.concursos, tamanhoLote)
  for (const lote of lotesConcursos) {
    try {
      const response = await api.post('/api/concursos/bulk', { concursos: lote })
      resultados.concursos.migrados += response.data.migrados
    } catch (error) {
      console.error('Erro ao migrar lote de concursos:', error)
      resultados.concursos.erros += lote.length
    }
  }

  // Migrar questões (dependem de concursos)
  const lotesQuestoes = chunk(dados.questoes, tamanhoLote)
  for (const lote of lotesQuestoes) {
    try {
      const response = await api.post('/api/questoes/bulk', { questoes: lote })
      resultados.questoes.migrados += response.data.migrados
    } catch (error) {
      console.error('Erro ao migrar lote de questões:', error)
      resultados.questoes.erros += lote.length
    }
  }

  // Migrar sessões de estudo
  const lotesSessoes = chunk(dados.sessoes, tamanhoLote)
  for (const lote of lotesSessoes) {
    try {
      const response = await api.post('/api/sessoes-estudo/bulk', { sessoes: lote })
      resultados.sessoes.migrados += response.data.migrados
    } catch (error) {
      console.error('Erro ao migrar lote de sessões:', error)
      resultados.sessoes.erros += lote.length
    }
  }

  return resultados
}
```

#### 2.2 Transformação de Dados
```typescript
const transformarDadosParaBanco = (dadosLocais: any) => {
  return {
    concursos: dadosLocais.concursos.map((concurso: any) => ({
      // Manter ID original para preservar relacionamentos
      id: concurso.id,
      titulo: concurso.titulo,
      organizadora: concurso.organizadora,
      data_inscricao: concurso.dataInscricao,
      data_prova: concurso.dataProva,
      edital: concurso.edital || null,
      status: concurso.status || 'planejado',
      conteudo_programatico: concurso.conteudoProgramatico || []
    })),
    
    questoes: dadosLocais.questoes.map((questao: any) => ({
      id: questao.id,
      concurso_id: questao.concursoId || null,
      disciplina: questao.disciplina,
      topico: questao.topico || null,
      enunciado: questao.enunciado,
      alternativas: questao.alternativas,
      resposta_correta: questao.respostaCorreta,
      justificativa: questao.justificativa || null,
      nivel_dificuldade: questao.nivelDificuldade || 'medio',
      ano: questao.ano || null,
      banca: questao.banca || null,
      tags: questao.tags || []
    })),
    
    sessoes: dadosLocais.sessoes.map((sessao: any) => ({
      id: sessao.id,
      titulo: sessao.titulo,
      descricao: sessao.descricao || null,
      duracao: sessao.duracao,
      data: sessao.data,
      completo: sessao.completo || false
    }))
  }
}
```

### Fase 3: Verificação e Rollback (Semana 5, Dia 5)

#### 3.1 Verificação Pós-Migração
```typescript
const verificarMigracao = async () => {
  const dadosLocais = criarBackupCompleto().dados
  const dadosBanco = await api.get('/api/dados-completos')
  
  const comparacao = {
    concursos: {
      local: dadosLocais.concursos.length,
      banco: dadosBanco.concursos.length,
      diferenca: dadosLocais.concursos.length - dadosBanco.concursos.length
    },
    questoes: {
      local: dadosLocais.questoes.length,
      banco: dadosBanco.questoes.length,
      diferenca: dadosLocais.questoes.length - dadosBanco.questoes.length
    },
    integridade: {
      relacionamentosPreservados: true,
      dadosConsistentes: true
    }
  }
  
  // Verificar relacionamentos
  const questoesComConcursoInvalido = dadosBanco.questoes.filter((q: any) => 
    q.concurso_id && !dadosBanco.concursos.some((c: any) => c.id === q.concurso_id)
  )
  
  if (questoesComConcursoInvalido.length > 0) {
    comparacao.integridade.relacionamentosPreservados = false
  }
  
  return comparacao
}
```

#### 3.2 Plano de Rollback
```typescript
const executarRollback = async (backup: any) => {
  console.log('🚨 Iniciando rollback da migração...')
  
  try {
    // 1. Limpar dados do banco
    await api.delete('/api/dados-completos')
    
    // 2. Restaurar localStorage
    localStorage.setItem('concursos-storage', JSON.stringify(backup.dados.concursos))
    localStorage.setItem('questoes-store', JSON.stringify(backup.dados.questoes))
    localStorage.setItem('registro-estudos-storage', JSON.stringify(backup.dados.sessoes))
    localStorage.setItem('pomodoro-storage', JSON.stringify(backup.dados.pomodoro))
    localStorage.setItem('historico-simulados-storage', JSON.stringify(backup.dados.historico))
    
    // 3. Restaurar dados específicos
    Object.entries(backup.dados.simuladosPersonalizados).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value))
    })
    
    Object.entries(backup.dados.simuladosFavoritos).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value))
    })
    
    console.log('✅ Rollback concluído com sucesso')
    return true
  } catch (error) {
    console.error('❌ Erro durante rollback:', error)
    return false
  }
}
```

---

## 🔄 PERÍODO DE TRANSIÇÃO

### Modo Híbrido (Semanas 6-7)
Durante o período de transição, o sistema funcionará em modo híbrido:

```typescript
const dataService = {
  // Lê do banco se disponível, senão do localStorage
  async getConcursos() {
    try {
      const response = await api.get('/api/concursos')
      return response.data
    } catch (error) {
      console.warn('Fallback para localStorage')
      return JSON.parse(localStorage.getItem('concursos-storage') || '[]')
    }
  },
  
  // Salva em ambos durante transição
  async saveConcurso(concurso: Concurso) {
    try {
      const response = await api.post('/api/concursos', concurso)
      // Atualizar localStorage também
      const concursosLocais = JSON.parse(localStorage.getItem('concursos-storage') || '[]')
      const index = concursosLocais.findIndex((c: any) => c.id === concurso.id)
      if (index >= 0) {
        concursosLocais[index] = concurso
      } else {
        concursosLocais.push(concurso)
      }
      localStorage.setItem('concursos-storage', JSON.stringify(concursosLocais))
      return response.data
    } catch (error) {
      // Fallback para localStorage apenas
      console.warn('Salvando apenas no localStorage')
      const concursosLocais = JSON.parse(localStorage.getItem('concursos-storage') || '[]')
      concursosLocais.push(concurso)
      localStorage.setItem('concursos-storage', JSON.stringify(concursosLocais))
      return concurso
    }
  }
}
```

---

## 📊 MONITORAMENTO E MÉTRICAS

### Métricas de Migração
- **Taxa de Sucesso**: > 99.9%
- **Tempo de Migração**: < 5 minutos
- **Integridade de Dados**: 100%
- **Disponibilidade**: > 99.5% durante transição

### Dashboard de Acompanhamento
```typescript
const metricas = {
  migracao: {
    concursosMigrados: 0,
    questoesMigradas: 0,
    sessoesMigradas: 0,
    erros: 0,
    tempoDecorrido: 0
  },
  integridade: {
    relacionamentosValidos: 0,
    dadosConsistentes: true,
    backupDisponivel: true
  },
  performance: {
    tempoResposta: 0,
    throughput: 0,
    errorRate: 0
  }
}
```

---

## ✅ CRITÉRIOS DE SUCESSO

### Pré-Migração
- [ ] Backup completo criado
- [ ] Validação de integridade OK
- [ ] Ambiente de destino testado
- [ ] Plano de rollback validado

### Durante Migração
- [ ] Monitoramento ativo
- [ ] Logs detalhados
- [ ] Verificação incremental
- [ ] Comunicação com usuários

### Pós-Migração
- [ ] Verificação completa OK
- [ ] Performance mantida
- [ ] Funcionalidades preservadas
- [ ] Usuários notificados

### Critérios de Rollback
- ❌ Perda de dados > 0.1%
- ❌ Tempo de migração > 10 minutos
- ❌ Erros críticos > 1%
- ❌ Performance degradada > 50%
