import { prisma } from '../prisma'

// Tipos para Registro de Sono
export type RegistroSonoCreateInput = {
  inicio: Date
  fim?: Date | null
  qualidade?: number | null
  notas?: string | null
  usuarioId: string
}

export type RegistroSonoUpdateInput = Partial<Omit<RegistroSonoCreateInput, 'usuarioId'>>

// Tipos para Lembretes de Sono
export type LembreteSonoCreateInput = {
  tipo: string // 'dormir' ou 'acordar'
  horario: string
  diasSemana: number[]
  ativo?: boolean
  usuarioId: string
}

export type LembreteSonoUpdateInput = Partial<Omit<LembreteSonoCreateInput, 'usuarioId'>>

export const sonoService = {
  // Serviços para Registros de Sono
  registros: {
    /**
     * Cria um novo registro de sono
     */
    async criar(data: RegistroSonoCreateInput) {
      return prisma.registroSono.create({
        data
      })
    },

    /**
     * Busca todos os registros de sono de um usuário
     */
    async listarPorUsuario(usuarioId: string) {
      return prisma.registroSono.findMany({
        where: { usuarioId },
        orderBy: { inicio: 'desc' }
      })
    },

    /**
     * Busca registros de sono por período
     */
    async listarPorPeriodo(usuarioId: string, dataInicio: Date, dataFim: Date) {
      return prisma.registroSono.findMany({
        where: {
          usuarioId,
          inicio: {
            gte: dataInicio,
            lte: dataFim
          }
        },
        orderBy: { inicio: 'asc' }
      })
    },

    /**
     * Atualiza um registro de sono
     */
    async atualizar(id: string, data: RegistroSonoUpdateInput) {
      return prisma.registroSono.update({
        where: { id },
        data
      })
    },

    /**
     * Finaliza um registro de sono (adiciona horário de fim e qualidade)
     */
    async finalizar(id: string, fim: Date, qualidade?: number, notas?: string) {
      return prisma.registroSono.update({
        where: { id },
        data: {
          fim,
          qualidade,
          notas
        }
      })
    },

    /**
     * Remove um registro de sono
     */
    async remover(id: string) {
      return prisma.registroSono.delete({
        where: { id }
      })
    },

    /**
     * Calcula a duração média de sono em um período
     */
    async calcularMediaDuracao(usuarioId: string, dataInicio: Date, dataFim: Date) {
      const registros = await this.listarPorPeriodo(usuarioId, dataInicio, dataFim)
      
      // Filtra apenas registros completos (com início e fim)
      const registrosCompletos = registros.filter(
        (registro: any): registro is typeof registro & { fim: Date } =>
          registro.fim !== null
      )
      
      if (registrosCompletos.length === 0) return 0
      
      // Calcula a duração total em minutos
      const duracaoTotal = registrosCompletos.reduce((total: number, registro: { inicio: Date, fim: Date }) => {
        const duracao = (registro.fim.getTime() - registro.inicio.getTime()) / (1000 * 60)
        return total + duracao
      }, 0)
      
      // Retorna a média em minutos
      return duracaoTotal / registrosCompletos.length
    }
  },

  // Serviços para Lembretes de Sono
  lembretes: {
    /**
     * Cria um novo lembrete de sono
     */
    async criar(data: LembreteSonoCreateInput) {
      return prisma.lembreteSono.create({
        data
      })
    },

    /**
     * Busca todos os lembretes de sono de um usuário
     */
    async listarPorUsuario(usuarioId: string) {
      return prisma.lembreteSono.findMany({
        where: { usuarioId }
      })
    },

    /**
     * Atualiza um lembrete de sono
     */
    async atualizar(id: string, data: LembreteSonoUpdateInput) {
      return prisma.lembreteSono.update({
        where: { id },
        data
      })
    },

    /**
     * Alterna o estado ativo de um lembrete
     */
    async alternarAtivo(id: string) {
      const lembrete = await prisma.lembreteSono.findUnique({
        where: { id },
        select: { ativo: true }
      })

      if (!lembrete) throw new Error('Lembrete não encontrado')

      return prisma.lembreteSono.update({
        where: { id },
        data: {
          ativo: !lembrete.ativo
        }
      })
    },

    /**
     * Remove um lembrete de sono
     */
    async remover(id: string) {
      return prisma.lembreteSono.delete({
        where: { id }
      })
    }
  }
}