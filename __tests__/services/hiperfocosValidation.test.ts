import { describe, it, expect } from 'vitest'
import { 
  validateHiperfoco, 
  validateTarefa, 
  validateSessaoAlternancia,
  ValidationError 
} from '@/app/lib/services/hiperfocosValidation'

describe('HiperfocosValidation', () => {
  describe('validateHiperfoco', () => {
    it('deve validar um hiperfoco válido', () => {
      const hiperfoco = {
        titulo: 'Estudar React',
        descricao: 'Aprender hooks e context',
        cor: '#FF5252',
        tempoLimite: 60
      }
      
      expect(() => validateHiperfoco(hiperfoco)).not.toThrow()
    })

    it('deve rejeitar título vazio', () => {
      const hiperfoco = {
        titulo: '',
        descricao: 'Descrição válida',
        cor: '#FF5252'
      }
      
      expect(() => validateHiperfoco(hiperfoco)).toThrow(ValidationError)
      expect(() => validateHiperfoco(hiperfoco)).toThrow('Título é obrigatório')
    })

    it('deve rejeitar título muito longo', () => {
      const hiperfoco = {
        titulo: 'a'.repeat(256), // Muito longo
        descricao: 'Descrição válida',
        cor: '#FF5252'
      }
      
      expect(() => validateHiperfoco(hiperfoco)).toThrow(ValidationError)
      expect(() => validateHiperfoco(hiperfoco)).toThrow('Título deve ter no máximo 255 caracteres')
    })

    it('deve rejeitar cor inválida', () => {
      const hiperfoco = {
        titulo: 'Título válido',
        descricao: 'Descrição válida',
        cor: 'cor-inválida'
      }
      
      expect(() => validateHiperfoco(hiperfoco)).toThrow(ValidationError)
      expect(() => validateHiperfoco(hiperfoco)).toThrow('Cor deve estar no formato hexadecimal (#RRGGBB)')
    })

    it('deve rejeitar tempo limite negativo', () => {
      const hiperfoco = {
        titulo: 'Título válido',
        descricao: 'Descrição válida',
        cor: '#FF5252',
        tempoLimite: -10
      }
      
      expect(() => validateHiperfoco(hiperfoco)).toThrow(ValidationError)
      expect(() => validateHiperfoco(hiperfoco)).toThrow('Tempo limite deve ser positivo')
    })

    it('deve aceitar tempo limite undefined', () => {
      const hiperfoco = {
        titulo: 'Título válido',
        descricao: 'Descrição válida',
        cor: '#FF5252',
        tempoLimite: undefined
      }
      
      expect(() => validateHiperfoco(hiperfoco)).not.toThrow()
    })

    it('deve rejeitar descrição muito longa', () => {
      const hiperfoco = {
        titulo: 'Título válido',
        descricao: 'a'.repeat(1001), // Muito longa
        cor: '#FF5252'
      }
      
      expect(() => validateHiperfoco(hiperfoco)).toThrow(ValidationError)
      expect(() => validateHiperfoco(hiperfoco)).toThrow('Descrição deve ter no máximo 1000 caracteres')
    })
  })

  describe('validateTarefa', () => {
    it('deve validar uma tarefa válida', () => {
      const tarefa = {
        texto: 'Tarefa válida'
      }
      
      expect(() => validateTarefa(tarefa)).not.toThrow()
    })

    it('deve rejeitar texto vazio', () => {
      const tarefa = {
        texto: ''
      }
      
      expect(() => validateTarefa(tarefa)).toThrow(ValidationError)
      expect(() => validateTarefa(tarefa)).toThrow('Texto da tarefa é obrigatório')
    })

    it('deve rejeitar texto apenas com espaços', () => {
      const tarefa = {
        texto: '   '
      }
      
      expect(() => validateTarefa(tarefa)).toThrow(ValidationError)
      expect(() => validateTarefa(tarefa)).toThrow('Texto da tarefa é obrigatório')
    })

    it('deve rejeitar texto muito longo', () => {
      const tarefa = {
        texto: 'a'.repeat(501) // Muito longo
      }
      
      expect(() => validateTarefa(tarefa)).toThrow(ValidationError)
      expect(() => validateTarefa(tarefa)).toThrow('Texto da tarefa deve ter no máximo 500 caracteres')
    })

    it('deve aceitar cor válida', () => {
      const tarefa = {
        texto: 'Tarefa com cor',
        cor: '#00BCD4'
      }
      
      expect(() => validateTarefa(tarefa)).not.toThrow()
    })

    it('deve rejeitar cor inválida', () => {
      const tarefa = {
        texto: 'Tarefa com cor inválida',
        cor: 'azul'
      }
      
      expect(() => validateTarefa(tarefa)).toThrow(ValidationError)
      expect(() => validateTarefa(tarefa)).toThrow('Cor deve estar no formato hexadecimal (#RRGGBB)')
    })
  })

  describe('validateSessaoAlternancia', () => {
    it('deve validar uma sessão válida', () => {
      const sessao = {
        titulo: 'Sessão de Estudo',
        hiperfocoAtual: 'hiperfoco-id-123',
        duracaoEstimada: 60
      }
      
      expect(() => validateSessaoAlternancia(sessao)).not.toThrow()
    })

    it('deve rejeitar título vazio', () => {
      const sessao = {
        titulo: '',
        hiperfocoAtual: 'hiperfoco-id-123',
        duracaoEstimada: 60
      }
      
      expect(() => validateSessaoAlternancia(sessao)).toThrow(ValidationError)
      expect(() => validateSessaoAlternancia(sessao)).toThrow('Título da sessão é obrigatório')
    })

    it('deve rejeitar duração negativa', () => {
      const sessao = {
        titulo: 'Sessão válida',
        hiperfocoAtual: 'hiperfoco-id-123',
        duracaoEstimada: -30
      }
      
      expect(() => validateSessaoAlternancia(sessao)).toThrow(ValidationError)
      expect(() => validateSessaoAlternancia(sessao)).toThrow('Duração estimada deve ser positiva')
    })

    it('deve rejeitar duração zero', () => {
      const sessao = {
        titulo: 'Sessão válida',
        hiperfocoAtual: 'hiperfoco-id-123',
        duracaoEstimada: 0
      }
      
      expect(() => validateSessaoAlternancia(sessao)).toThrow(ValidationError)
      expect(() => validateSessaoAlternancia(sessao)).toThrow('Duração estimada deve ser positiva')
    })

    it('deve aceitar hiperfoco atual null', () => {
      const sessao = {
        titulo: 'Sessão sem hiperfoco',
        hiperfocoAtual: null,
        duracaoEstimada: 60
      }
      
      expect(() => validateSessaoAlternancia(sessao)).not.toThrow()
    })

    it('deve rejeitar ID de hiperfoco vazio', () => {
      const sessao = {
        titulo: 'Sessão válida',
        hiperfocoAtual: '',
        duracaoEstimada: 60
      }
      
      expect(() => validateSessaoAlternancia(sessao)).toThrow(ValidationError)
      expect(() => validateSessaoAlternancia(sessao)).toThrow('ID do hiperfoco não pode ser vazio')
    })
  })

  describe('ValidationError', () => {
    it('deve ser uma instância de Error', () => {
      const error = new ValidationError('Teste')
      
      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('ValidationError')
      expect(error.message).toBe('Teste')
    })
  })
})
