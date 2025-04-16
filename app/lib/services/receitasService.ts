import { prisma } from '../prisma'

// Tipos para Ingrediente
export type IngredienteInput = {
  nome: string
  quantidade: number
  unidade: string
}

// Tipos para Passo de Receita
export type PassoReceitaInput = {
  ordem: number
  descricao: string
}

// Tipos para Receita
export type ReceitaCreateInput = {
  nome: string
  descricao: string
  categorias: string[]
  tags: string[]
  tempoPreparo: number
  porcoes: number
  calorias: string
  imagem?: string | null
  ingredientes: IngredienteInput[]
  passos: PassoReceitaInput[]
  usuarioId: string
}

export type ReceitaUpdateInput = Partial<Omit<ReceitaCreateInput, 'usuarioId' | 'ingredientes' | 'passos'>>

export const receitasService = {
  /**
   * Cria uma nova receita com ingredientes e passos
   */
  async criar(data: ReceitaCreateInput) {
    const { ingredientes, passos, ...receitaData } = data

    return prisma.receita.create({
      data: {
        ...receitaData,
        ingredientes: {
          create: ingredientes.map(ingrediente => ({
            nome: ingrediente.nome,
            quantidade: ingrediente.quantidade,
            unidade: ingrediente.unidade
          }))
        },
        passos: {
          create: passos.map(passo => ({
            ordem: passo.ordem,
            descricao: passo.descricao
          }))
        }
      },
      include: {
        ingredientes: true,
        passos: {
          orderBy: {
            ordem: 'asc'
          }
        }
      }
    })
  },

  /**
   * Busca todas as receitas de um usuário
   */
  async listarPorUsuario(usuarioId: string) {
    return prisma.receita.findMany({
      where: { usuarioId },
      include: {
        ingredientes: true,
        passos: {
          orderBy: {
            ordem: 'asc'
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    })
  },

  /**
   * Busca uma receita pelo ID
   */
  async buscarPorId(id: string) {
    return prisma.receita.findUnique({
      where: { id },
      include: {
        ingredientes: true,
        passos: {
          orderBy: {
            ordem: 'asc'
          }
        }
      }
    })
  },

  /**
   * Busca receitas por categoria
   */
  async buscarPorCategoria(usuarioId: string, categoria: string) {
    return prisma.receita.findMany({
      where: {
        usuarioId,
        categorias: {
          has: categoria
        }
      },
      include: {
        ingredientes: true,
        passos: {
          orderBy: {
            ordem: 'asc'
          }
        }
      }
    })
  },

  /**
   * Busca receitas por tag
   */
  async buscarPorTag(usuarioId: string, tag: string) {
    return prisma.receita.findMany({
      where: {
        usuarioId,
        tags: {
          has: tag
        }
      },
      include: {
        ingredientes: true,
        passos: {
          orderBy: {
            ordem: 'asc'
          }
        }
      }
    })
  },

  /**
   * Atualiza uma receita
   * Não atualiza ingredientes ou passos
   */
  async atualizar(id: string, data: ReceitaUpdateInput) {
    return prisma.receita.update({
      where: { id },
      data,
      include: {
        ingredientes: true,
        passos: {
          orderBy: {
            ordem: 'asc'
          }
        }
      }
    })
  },

  /**
   * Atualiza os ingredientes de uma receita
   * Remove todos os ingredientes existentes e adiciona os novos
   */
  async atualizarIngredientes(receitaId: string, ingredientes: IngredienteInput[]) {
    // Primeiro remove todos os ingredientes existentes
    await prisma.ingrediente.deleteMany({
      where: { receitaId }
    })

    // Depois adiciona os novos ingredientes
    await prisma.ingrediente.createMany({
      data: ingredientes.map(ingrediente => ({
        receitaId,
        nome: ingrediente.nome,
        quantidade: ingrediente.quantidade,
        unidade: ingrediente.unidade
      }))
    })

    // Retorna a receita atualizada
    return this.buscarPorId(receitaId)
  },

  /**
   * Atualiza os passos de uma receita
   * Remove todos os passos existentes e adiciona os novos
   */
  async atualizarPassos(receitaId: string, passos: PassoReceitaInput[]) {
    // Primeiro remove todos os passos existentes
    await prisma.passoReceita.deleteMany({
      where: { receitaId }
    })

    // Depois adiciona os novos passos
    await prisma.passoReceita.createMany({
      data: passos.map(passo => ({
        receitaId,
        ordem: passo.ordem,
        descricao: passo.descricao
      }))
    })

    // Retorna a receita atualizada
    return this.buscarPorId(receitaId)
  },

  /**
   * Remove uma receita
   * Também remove todos os ingredientes e passos relacionados (cascade)
   */
  async remover(id: string) {
    return prisma.receita.delete({
      where: { id }
    })
  },

  // Serviços para favoritos
  favoritos: {
    /**
     * Adiciona uma receita aos favoritos
     */
    async adicionar(usuarioId: string, receitaId: string) {
      return prisma.receitaFavorita.create({
        data: {
          usuarioId,
          receitaId
        }
      })
    },

    /**
     * Remove uma receita dos favoritos
     */
    async remover(usuarioId: string, receitaId: string) {
      return prisma.receitaFavorita.deleteMany({
        where: {
          usuarioId,
          receitaId
        }
      })
    },

    /**
     * Verifica se uma receita está nos favoritos
     */
    async verificar(usuarioId: string, receitaId: string) {
      const favorito = await prisma.receitaFavorita.findFirst({
        where: {
          usuarioId,
          receitaId
        }
      })
      
      return !!favorito
    },

    /**
     * Lista todas as receitas favoritas de um usuário
     */
    async listar(usuarioId: string) {
      const favoritos = await prisma.receitaFavorita.findMany({
        where: { usuarioId },
        include: {
          receita: {
            include: {
              ingredientes: true,
              passos: {
                orderBy: {
                  ordem: 'asc'
                }
              }
            }
          }
        }
      })
      
      return favoritos.map((favorito: { receita: any }) => favorito.receita)
    },

    /**
     * Alterna o estado de favorito de uma receita
     */
    async alternar(usuarioId: string, receitaId: string) {
      const favorito = await this.verificar(usuarioId, receitaId)
      
      if (favorito) {
        await this.remover(usuarioId, receitaId)
        return false
      } else {
        await this.adicionar(usuarioId, receitaId)
        return true
      }
    }
  }
}