import { prisma } from '../prisma'

// Tipos para criação e atualização de usuário
export type UsuarioCreateInput = {
  email: string
  nome: string
  altoContraste?: boolean
  reducaoEstimulos?: boolean
  textoGrande?: boolean
  metaHorasSono?: number
  metaTarefasPrioritarias?: number
  metaCoposAgua?: number
  metaPausasProgramadas?: number
  notificacoesAtivas?: boolean
  pausasAtivas?: boolean
}

export type UsuarioUpdateInput = Partial<UsuarioCreateInput>

export const usuarioService = {
  /**
   * Cria um novo usuário
   */
  async criar(data: UsuarioCreateInput) {
    return prisma.usuario.create({
      data
    })
  },

  /**
   * Busca um usuário pelo ID
   */
  async buscarPorId(id: string) {
    return prisma.usuario.findUnique({
      where: { id }
    })
  },

  /**
   * Busca um usuário pelo email
   */
  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email }
    })
  },

  /**
   * Atualiza um usuário
   */
  async atualizar(id: string, data: UsuarioUpdateInput) {
    return prisma.usuario.update({
      where: { id },
      data
    })
  },

  /**
   * Atualiza as preferências visuais de um usuário
   */
  async atualizarPreferenciasVisuais(
    id: string, 
    { altoContraste, reducaoEstimulos, textoGrande }: { 
      altoContraste?: boolean, 
      reducaoEstimulos?: boolean, 
      textoGrande?: boolean 
    }
  ) {
    return prisma.usuario.update({
      where: { id },
      data: {
        altoContraste: altoContraste !== undefined ? altoContraste : undefined,
        reducaoEstimulos: reducaoEstimulos !== undefined ? reducaoEstimulos : undefined,
        textoGrande: textoGrande !== undefined ? textoGrande : undefined
      }
    })
  },

  /**
   * Atualiza as metas diárias de um usuário
   */
  async atualizarMetasDiarias(
    id: string, 
    { metaHorasSono, metaTarefasPrioritarias, metaCoposAgua, metaPausasProgramadas }: { 
      metaHorasSono?: number, 
      metaTarefasPrioritarias?: number, 
      metaCoposAgua?: number, 
      metaPausasProgramadas?: number 
    }
  ) {
    return prisma.usuario.update({
      where: { id },
      data: {
        metaHorasSono: metaHorasSono !== undefined ? metaHorasSono : undefined,
        metaTarefasPrioritarias: metaTarefasPrioritarias !== undefined ? metaTarefasPrioritarias : undefined,
        metaCoposAgua: metaCoposAgua !== undefined ? metaCoposAgua : undefined,
        metaPausasProgramadas: metaPausasProgramadas !== undefined ? metaPausasProgramadas : undefined
      }
    })
  },

  /**
   * Alterna o estado das notificações
   */
  async alternarNotificacoes(id: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { notificacoesAtivas: true }
    })

    if (!usuario) throw new Error('Usuário não encontrado')

    return prisma.usuario.update({
      where: { id },
      data: {
        notificacoesAtivas: !usuario.notificacoesAtivas
      }
    })
  },

  /**
   * Alterna o estado das pausas
   */
  async alternarPausas(id: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { pausasAtivas: true }
    })

    if (!usuario) throw new Error('Usuário não encontrado')

    return prisma.usuario.update({
      where: { id },
      data: {
        pausasAtivas: !usuario.pausasAtivas
      }
    })
  }
}