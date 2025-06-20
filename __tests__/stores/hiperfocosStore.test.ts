import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useHiperfocosStore, type Hiperfoco, type Tarefa, type SessaoAlternancia } from '@/app/stores/hiperfocosStore'

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('HiperfocosStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // Reset store state
    useHiperfocosStore.setState({
      hiperfocos: [],
      sessoes: []
    })
  })

  describe('Hiperfocos CRUD', () => {
    it('deve adicionar um novo hiperfoco', () => {
      const store = useHiperfocosStore.getState()
      
      const hiperfocoId = store.adicionarHiperfoco(
        'Estudar React',
        'Aprender hooks e context',
        '#FF5252',
        60
      )
      
      expect(hiperfocoId).toBeDefined()
      expect(typeof hiperfocoId).toBe('string')
      
      const state = useHiperfocosStore.getState()
      expect(state.hiperfocos).toHaveLength(1)
      
      const hiperfoco = state.hiperfocos[0]
      expect(hiperfoco.titulo).toBe('Estudar React')
      expect(hiperfoco.descricao).toBe('Aprender hooks e context')
      expect(hiperfoco.cor).toBe('#FF5252')
      expect(hiperfoco.tempoLimite).toBe(60)
      expect(hiperfoco.tarefas).toEqual([])
      expect(hiperfoco.subTarefas).toEqual({})
    })

    it('deve atualizar um hiperfoco existente', () => {
      const store = useHiperfocosStore.getState()
      
      const hiperfocoId = store.adicionarHiperfoco(
        'Título Original',
        'Descrição Original',
        '#FF5252'
      )
      
      store.atualizarHiperfoco(
        hiperfocoId,
        'Título Atualizado',
        'Descrição Atualizada',
        '#00BCD4',
        90
      )
      
      const state = useHiperfocosStore.getState()
      const hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      
      expect(hiperfoco?.titulo).toBe('Título Atualizado')
      expect(hiperfoco?.descricao).toBe('Descrição Atualizada')
      expect(hiperfoco?.cor).toBe('#00BCD4')
      expect(hiperfoco?.tempoLimite).toBe(90)
    })

    it('deve remover um hiperfoco', () => {
      const store = useHiperfocosStore.getState()
      
      const hiperfocoId = store.adicionarHiperfoco(
        'Para Remover',
        'Será removido',
        '#FF5252'
      )
      
      expect(useHiperfocosStore.getState().hiperfocos).toHaveLength(1)
      
      store.removerHiperfoco(hiperfocoId)
      
      expect(useHiperfocosStore.getState().hiperfocos).toHaveLength(0)
    })
  })

  describe('Tarefas CRUD', () => {
    let hiperfocoId: string

    beforeEach(() => {
      const store = useHiperfocosStore.getState()
      hiperfocoId = store.adicionarHiperfoco(
        'Hiperfoco Teste',
        'Para testar tarefas',
        '#FF5252'
      )
    })

    it('deve adicionar uma tarefa a um hiperfoco', () => {
      const store = useHiperfocosStore.getState()
      
      const tarefaId = store.adicionarTarefa(hiperfocoId, 'Primeira tarefa')
      
      expect(tarefaId).toBeDefined()
      expect(typeof tarefaId).toBe('string')
      
      const state = useHiperfocosStore.getState()
      const hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      
      expect(hiperfoco?.tarefas).toHaveLength(1)
      expect(hiperfoco?.tarefas[0].texto).toBe('Primeira tarefa')
      expect(hiperfoco?.tarefas[0].concluida).toBe(false)
    })

    it('deve atualizar o texto de uma tarefa', () => {
      const store = useHiperfocosStore.getState()
      
      const tarefaId = store.adicionarTarefa(hiperfocoId, 'Texto original')
      store.atualizarTarefa(hiperfocoId, tarefaId, 'Texto atualizado')
      
      const state = useHiperfocosStore.getState()
      const hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      const tarefa = hiperfoco?.tarefas.find(t => t.id === tarefaId)
      
      expect(tarefa?.texto).toBe('Texto atualizado')
    })

    it('deve alternar o status de conclusão de uma tarefa', () => {
      const store = useHiperfocosStore.getState()
      
      const tarefaId = store.adicionarTarefa(hiperfocoId, 'Tarefa para toggle')
      
      // Inicialmente não concluída
      let state = useHiperfocosStore.getState()
      let hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      let tarefa = hiperfoco?.tarefas.find(t => t.id === tarefaId)
      expect(tarefa?.concluida).toBe(false)
      
      // Toggle para concluída
      store.toggleTarefaConcluida(hiperfocoId, tarefaId)
      
      state = useHiperfocosStore.getState()
      hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      tarefa = hiperfoco?.tarefas.find(t => t.id === tarefaId)
      expect(tarefa?.concluida).toBe(true)
      
      // Toggle de volta para não concluída
      store.toggleTarefaConcluida(hiperfocoId, tarefaId)
      
      state = useHiperfocosStore.getState()
      hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      tarefa = hiperfoco?.tarefas.find(t => t.id === tarefaId)
      expect(tarefa?.concluida).toBe(false)
    })

    it('deve remover uma tarefa', () => {
      const store = useHiperfocosStore.getState()
      
      const tarefaId = store.adicionarTarefa(hiperfocoId, 'Tarefa para remover')
      
      let state = useHiperfocosStore.getState()
      let hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      expect(hiperfoco?.tarefas).toHaveLength(1)
      
      store.removerTarefa(hiperfocoId, tarefaId)
      
      state = useHiperfocosStore.getState()
      hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      expect(hiperfoco?.tarefas).toHaveLength(0)
    })
  })

  describe('SubTarefas CRUD', () => {
    let hiperfocoId: string
    let tarefaId: string

    beforeEach(() => {
      const store = useHiperfocosStore.getState()
      hiperfocoId = store.adicionarHiperfoco(
        'Hiperfoco Teste',
        'Para testar subtarefas',
        '#FF5252'
      )
      tarefaId = store.adicionarTarefa(hiperfocoId, 'Tarefa principal')
    })

    it('deve adicionar uma subtarefa a uma tarefa', () => {
      const store = useHiperfocosStore.getState()
      
      const subTarefaId = store.adicionarSubTarefa(hiperfocoId, tarefaId, 'Primeira subtarefa')
      
      expect(subTarefaId).toBeDefined()
      expect(typeof subTarefaId).toBe('string')
      
      const state = useHiperfocosStore.getState()
      const hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      
      expect(hiperfoco?.subTarefas[tarefaId]).toHaveLength(1)
      expect(hiperfoco?.subTarefas[tarefaId][0].texto).toBe('Primeira subtarefa')
      expect(hiperfoco?.subTarefas[tarefaId][0].concluida).toBe(false)
    })

    it('deve alternar o status de conclusão de uma subtarefa', () => {
      const store = useHiperfocosStore.getState()
      
      const subTarefaId = store.adicionarSubTarefa(hiperfocoId, tarefaId, 'Subtarefa para toggle')
      
      // Toggle para concluída
      store.toggleSubTarefaConcluida(hiperfocoId, tarefaId, subTarefaId)
      
      const state = useHiperfocosStore.getState()
      const hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      const subTarefa = hiperfoco?.subTarefas[tarefaId].find(st => st.id === subTarefaId)
      
      expect(subTarefa?.concluida).toBe(true)
    })

    it('deve remover uma subtarefa', () => {
      const store = useHiperfocosStore.getState()
      
      const subTarefaId = store.adicionarSubTarefa(hiperfocoId, tarefaId, 'Subtarefa para remover')
      
      let state = useHiperfocosStore.getState()
      let hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      expect(hiperfoco?.subTarefas[tarefaId]).toHaveLength(1)
      
      store.removerSubTarefa(hiperfocoId, tarefaId, subTarefaId)
      
      state = useHiperfocosStore.getState()
      hiperfoco = state.hiperfocos.find(h => h.id === hiperfocoId)
      expect(hiperfoco?.subTarefas[tarefaId]).toHaveLength(0)
    })
  })

  describe('Sessões de Alternância', () => {
    let hiperfocoId: string

    beforeEach(() => {
      const store = useHiperfocosStore.getState()
      hiperfocoId = store.adicionarHiperfoco(
        'Hiperfoco para Sessão',
        'Teste de sessões',
        '#FF5252'
      )
    })

    it('deve adicionar uma nova sessão de alternância', () => {
      const store = useHiperfocosStore.getState()
      
      const sessaoId = store.adicionarSessao(
        'Sessão de Teste',
        hiperfocoId,
        60
      )
      
      expect(sessaoId).toBeDefined()
      expect(typeof sessaoId).toBe('string')
      
      const state = useHiperfocosStore.getState()
      expect(state.sessoes).toHaveLength(1)
      
      const sessao = state.sessoes[0]
      expect(sessao.titulo).toBe('Sessão de Teste')
      expect(sessao.hiperfocoAtual).toBe(hiperfocoId)
      expect(sessao.duracaoEstimada).toBe(60)
      expect(sessao.concluida).toBe(false)
    })

    it('deve alternar hiperfoco em uma sessão', () => {
      const store = useHiperfocosStore.getState()
      
      const outroHiperfocoId = store.adicionarHiperfoco(
        'Outro Hiperfoco',
        'Para alternância',
        '#00BCD4'
      )
      
      const sessaoId = store.adicionarSessao(
        'Sessão de Alternância',
        hiperfocoId,
        60
      )
      
      store.alternarHiperfoco(sessaoId, outroHiperfocoId)
      
      const state = useHiperfocosStore.getState()
      const sessao = state.sessoes.find(s => s.id === sessaoId)
      
      expect(sessao?.hiperfocoAnterior).toBe(hiperfocoId)
      expect(sessao?.hiperfocoAtual).toBe(outroHiperfocoId)
    })

    it('deve concluir uma sessão', () => {
      const store = useHiperfocosStore.getState()
      
      const sessaoId = store.adicionarSessao(
        'Sessão para Concluir',
        hiperfocoId,
        60
      )
      
      store.concluirSessao(sessaoId)
      
      const state = useHiperfocosStore.getState()
      const sessao = state.sessoes.find(s => s.id === sessaoId)
      
      expect(sessao?.concluida).toBe(true)
    })

    it('deve remover uma sessão', () => {
      const store = useHiperfocosStore.getState()
      
      const sessaoId = store.adicionarSessao(
        'Sessão para Remover',
        hiperfocoId,
        60
      )
      
      expect(useHiperfocosStore.getState().sessoes).toHaveLength(1)
      
      store.removerSessao(sessaoId)
      
      expect(useHiperfocosStore.getState().sessoes).toHaveLength(0)
    })
  })
})
