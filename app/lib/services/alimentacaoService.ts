import { prisma } from '../prisma'

// Tipos para Refeição
export type RefeicaoCreateInput = {
  horario: string
  descricao: string
  usuarioId: string
}

export type RefeicaoUpdateInput = Partial<Omit<RefeicaoCreateInput, 'usuarioId'>>

// Tipos para Registro de Refeição
export type RegistroRefeicaoCreateInput = {
  data: Date
  horario: string
  descricao: string
  tipoIcone?: string | null
  foto?: string | null
  usuarioId: string
}

export type RegistroRefeicaoUpdateInput = Partial<Omit<RegistroRefeicaoCreateInput, 'usuarioId'>>

// Tipos para Registro de Hidratação
export type RegistroHidratacaoCreateInput = {
  data?: Date
  horario: string
  quantidade: number
  usuarioId: string
}

export const alimentacaoService = {
  // Serviços para Refeições
  refeicoes: {
    /**
     * Cria uma nova refeição
     */
    async criar(data: RefeicaoCreateInput) {
      return prisma.refeicao.create({
        data
      })
    },

    /**
     * Busca todas as refeições de um usuário
     */
    async listarPorUsuario(usuarioId: string) {
      return prisma.refeicao.findMany({
        where: { usuarioId },
        orderBy: { horario: 'asc' }
      })
    },

    /**
     * Atualiza uma refeição
     */
    async atualizar(id: string, data: RefeicaoUpdateInput) {
      return prisma.refeicao.update({
        where: { id },
        data
      })
    },

    /**
     * Remove uma refeição
     */
    async remover(id: string) {
      return prisma.refeicao.delete({
        where: { id }
      })
    }
  },

  // Serviços para Registros de Refeições
  registros: {
    /**
     * Cria um novo registro de refeição
     */
    async criar(data: RegistroRefeicaoCreateInput) {
      return prisma.registroRefeicao.create({
        data
      })
    },

    /**
     * Busca todos os registros de refeição de um usuário
     */
    async listarPorUsuario(usuarioId: string) {
      return prisma.registroRefeicao.findMany({
        where: { usuarioId },
        orderBy: { data: 'desc' }
      })
    },

    /**
     * Busca registros de refeição por data
     */
    async listarPorData(usuarioId: string, data: Date) {
      const inicio = new Date(data)
      inicio.setHours(0, 0, 0, 0)
      
      const fim = new Date(data)
      fim.setHours(23, 59, 59, 999)
      
      return prisma.registroRefeicao.findMany({
        where: {
          usuarioId,
          data: {
            gte: inicio,
            lte: fim
          }
        },
        orderBy: { horario: 'asc' }
      })
    },

    /**
     * Remove um registro de refeição
     */
    async remover(id: string) {
      return prisma.registroRefeicao.delete({
        where: { id }
      })
    }
  },

  // Serviços para Hidratação
  hidratacao: {
    /**
     * Registra consumo de água
     */
    async registrarCopo(usuarioId: string, quantidade: number = 1) {
      const agora = new Date()
      const horario = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`
      
      return prisma.registroHidratacao.create({
        data: {
          usuarioId,
          data: agora,
          horario,
          quantidade
        }
      })
    },

    /**
     * Busca registros de hidratação por data
     */
    async listarPorData(usuarioId: string, data: Date) {
      const inicio = new Date(data)
      inicio.setHours(0, 0, 0, 0)
      
      const fim = new Date(data)
      fim.setHours(23, 59, 59, 999)
      
      return prisma.registroHidratacao.findMany({
        where: {
          usuarioId,
          data: {
            gte: inicio,
            lte: fim
          }
        },
        orderBy: { data: 'asc' }
      })
    },

    /**
     * Calcula o total de copos bebidos em um dia
     */
    async calcularTotalDia(usuarioId: string, data: Date) {
      const registros = await this.listarPorData(usuarioId, data)
      return registros.reduce((total: number, registro: { quantidade: number }) => total + registro.quantidade, 0)
    }
  }
}