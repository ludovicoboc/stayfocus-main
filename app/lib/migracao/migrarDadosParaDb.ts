/**
 * Utilitário para migrar dados das stores Zustand para o banco de dados Supabase
 *
 * Este arquivo contém funções para migrar dados armazenados localmente (localStorage via Zustand)
 * para o banco de dados PostgreSQL no Supabase usando o Prisma.
 * Inclui logs detalhados e tratamento de erros aprimorado.
 */

import { useSonoStore } from '../../stores/sonoStore'
import { useAlimentacaoStore } from '../../stores/alimentacaoStore'
import { useReceitasStore } from '../../stores/receitasStore'
import { usePerfilStore } from '../../stores/perfilStore'
import { prisma } from '../prisma'
import { Prisma } from '@prisma/client' // Importar tipos do Prisma

// Interface para o resultado da migração
interface ResultadoMigracaoModulo {
  sucesso: boolean
  mensagem: string
  migrados: number
  ignorados: number
  falhas: number
  erros: any[]
}

// Logger simples para a migração
const logger = {
  info: (mensagem: string) => console.info(`[Migracao INFO] ${mensagem}`),
  warn: (mensagem: string) => console.warn(`[Migracao WARN] ${mensagem}`),
  error: (mensagem: string, erro?: any) => console.error(`[Migracao ERROR] ${mensagem}`, erro),
}

/**
 * Migra o perfil do usuário para o banco de dados
 * @param usuarioId ID do usuário no banco de dados
 * @param email Email do usuário
 */
export async function migrarPerfil(usuarioId: string, email: string): Promise<ResultadoMigracaoModulo> {
  logger.info(`Iniciando migração do perfil para usuário ID: ${usuarioId}`)
  const perfilStore = usePerfilStore.getState()
  const resultado: ResultadoMigracaoModulo = { sucesso: false, mensagem: '', migrados: 0, ignorados: 0, falhas: 0, erros: [] }

  try {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    })

    const dadosPerfil = {
      nome: perfilStore.nome,
      altoContraste: perfilStore.preferenciasVisuais.altoContraste,
      reducaoEstimulos: perfilStore.preferenciasVisuais.reducaoEstimulos,
      textoGrande: perfilStore.preferenciasVisuais.textoGrande,
      metaHorasSono: perfilStore.metasDiarias.horasSono,
      metaTarefasPrioritarias: perfilStore.metasDiarias.tarefasPrioritarias,
      metaCoposAgua: perfilStore.metasDiarias.coposAgua,
      metaPausasProgramadas: perfilStore.metasDiarias.pausasProgramadas,
      notificacoesAtivas: perfilStore.notificacoesAtivas,
      pausasAtivas: perfilStore.pausasAtivas
    }

    if (usuarioExistente) {
      logger.info(`Usuário ${usuarioId} já existe. Atualizando perfil...`)
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: dadosPerfil
      })
      resultado.migrados = 1 // Consideramos atualização como migração bem-sucedida
      resultado.mensagem = 'Perfil de usuário atualizado com sucesso.'
    } else {
      logger.info(`Usuário ${usuarioId} não encontrado. Criando novo usuário...`)
      await prisma.usuario.create({
        data: {
          id: usuarioId,
          email,
          ...dadosPerfil
        }
      })
      resultado.migrados = 1
      resultado.mensagem = 'Novo perfil de usuário criado com sucesso.'
    }

    resultado.sucesso = true
    logger.info(`Migração do perfil para usuário ${usuarioId} concluída com sucesso.`)

  } catch (erro) {
    logger.error(`Erro ao migrar perfil para usuário ${usuarioId}:`, erro)
    resultado.sucesso = false
    resultado.mensagem = 'Erro ao migrar perfil.'
    resultado.falhas = 1
    if (erro instanceof Error) {
        resultado.erros.push({ tipo: 'Geral', mensagem: erro.message, stack: erro.stack });
    } else {
        resultado.erros.push({ tipo: 'Desconhecido', erro });
    }
  }
  return resultado
}

/**
 * Migra os registros de sono para o banco de dados
 * @param usuarioId ID do usuário no banco de dados
 */
export async function migrarRegistrosSono(usuarioId: string): Promise<ResultadoMigracaoModulo> {
  logger.info(`Iniciando migração de dados de sono para usuário ID: ${usuarioId}`)
  const sonoStore = useSonoStore.getState()
  const resultado: ResultadoMigracaoModulo = { sucesso: false, mensagem: '', migrados: 0, ignorados: 0, falhas: 0, erros: [] }
  let registrosMigrados = 0
  let registrosIgnorados = 0
  let registrosFalhas = 0
  let lembretesMigrados = 0
  let lembretesIgnorados = 0
  let lembretesFalhas = 0

  // Migrar Registros de Sono
  logger.info(`Migrando ${sonoStore.registros.length} registros de sono...`)
  for (const registro of sonoStore.registros) {
    try {
      const inicio = new Date(registro.inicio)
      const fim = registro.fim ? new Date(registro.fim) : null

      // Validação básica de data
      if (isNaN(inicio.getTime()) || (fim && isNaN(fim.getTime()))) {
          logger.warn(`Registro de sono com ID local ${registro.id} possui data inválida. Ignorando.`);
          registrosIgnorados++;
          continue;
      }

      // Verifica se o registro já existe (usando um intervalo de tempo para evitar duplicatas por pequenas diferenças)
      const registroExistente = await prisma.registroSono.findFirst({
        where: {
          usuarioId,
          inicio: {
            gte: new Date(inicio.getTime() - 60000), // 1 minuto antes
            lte: new Date(inicio.getTime() + 60000)  // 1 minuto depois
          }
        }
      })

      if (!registroExistente) {
        await prisma.registroSono.create({
          data: {
            usuarioId,
            inicio,
            fim,
            qualidade: registro.qualidade,
            notas: registro.notas
          }
        })
        registrosMigrados++
      } else {
        logger.info(`Registro de sono iniciado em ${inicio.toISOString()} já existe. Ignorando.`);
        registrosIgnorados++
      }
    } catch (erro) {
      logger.error(`Erro ao migrar registro de sono com ID local ${registro.id}:`, erro)
      registrosFalhas++
      if (erro instanceof Error) {
          resultado.erros.push({ tipo: 'RegistroSono', idLocal: registro.id, mensagem: erro.message });
      } else {
          resultado.erros.push({ tipo: 'RegistroSono', idLocal: registro.id, erro });
      }
    }
  }

  // Migrar Lembretes de Sono
  logger.info(`Migrando ${sonoStore.lembretes.length} lembretes de sono...`)
  for (const lembrete of sonoStore.lembretes) {
    try {
      // Verifica se o lembrete já existe
      const lembreteExistente = await prisma.lembreteSono.findFirst({
        where: {
          usuarioId,
          tipo: lembrete.tipo,
          horario: lembrete.horario,
          // Comparar arrays pode ser complexo, talvez verificar apenas tipo/horario seja suficiente
          // ou buscar e comparar os diasSemana no código.
        }
      })

      // Se existir, compara os dias da semana para ter certeza
      let deveCriar = !lembreteExistente;
      if (lembreteExistente) {
          const diasSemanaDb = lembreteExistente.diasSemana.sort().join(',');
          const diasSemanaStore = lembrete.diasSemana.sort().join(',');
          if (diasSemanaDb !== diasSemanaStore) {
              // Poderia atualizar, mas para migração inicial, vamos ignorar se já existe um similar
              logger.warn(`Lembrete de sono ${lembrete.tipo} às ${lembrete.horario} já existe com dias diferentes. Ignorando.`);
              deveCriar = false; // Decide não criar/atualizar por simplicidade na migração inicial
          } else {
              logger.info(`Lembrete de sono ${lembrete.tipo} às ${lembrete.horario} já existe. Ignorando.`);
          }
      }


      if (deveCriar) {
        await prisma.lembreteSono.create({
          data: {
            usuarioId,
            tipo: lembrete.tipo,
            horario: lembrete.horario,
            diasSemana: lembrete.diasSemana,
            ativo: lembrete.ativo
          }
        })
        lembretesMigrados++
      } else {
        lembretesIgnorados++
      }
    } catch (erro) {
      logger.error(`Erro ao migrar lembrete de sono com ID local ${lembrete.id}:`, erro)
      lembretesFalhas++
       if (erro instanceof Error) {
          resultado.erros.push({ tipo: 'LembreteSono', idLocal: lembrete.id, mensagem: erro.message });
      } else {
          resultado.erros.push({ tipo: 'LembreteSono', idLocal: lembrete.id, erro });
      }
    }
  }

  resultado.migrados = registrosMigrados + lembretesMigrados;
  resultado.ignorados = registrosIgnorados + lembretesIgnorados;
  resultado.falhas = registrosFalhas + lembretesFalhas;

  if (resultado.falhas === 0) {
    resultado.sucesso = true
    resultado.mensagem = `Dados de sono migrados: ${registrosMigrados} registros, ${lembretesMigrados} lembretes. Ignorados: ${registrosIgnorados} registros, ${lembretesIgnorados} lembretes.`
    logger.info(resultado.mensagem)
  } else {
    resultado.sucesso = false
    resultado.mensagem = `Erro ao migrar dados de sono. Falhas: ${registrosFalhas} registros, ${lembretesFalhas} lembretes.`
    logger.error(resultado.mensagem)
  }

  return resultado
}

/**
 * Migra os dados de alimentação para o banco de dados
 * @param usuarioId ID do usuário no banco de dados
 */
export async function migrarDadosAlimentacao(usuarioId: string): Promise<ResultadoMigracaoModulo> {
  logger.info(`Iniciando migração de dados de alimentação para usuário ID: ${usuarioId}`)
  const alimentacaoStore = useAlimentacaoStore.getState()
  const resultado: ResultadoMigracaoModulo = { sucesso: false, mensagem: '', migrados: 0, ignorados: 0, falhas: 0, erros: [] }
  let refeicoesMigradas = 0
  let refeicoesIgnoradas = 0
  let refeicoesFalhas = 0
  let registrosMigrados = 0
  let registrosIgnorados = 0
  let registrosFalhas = 0

  // Migrar Refeições Planejadas
  logger.info(`Migrando ${alimentacaoStore.refeicoes.length} refeições planejadas...`)
  for (const refeicao of alimentacaoStore.refeicoes) {
    try {
      const refeicaoExistente = await prisma.refeicao.findFirst({
        where: {
          usuarioId,
          horario: refeicao.horario,
          descricao: refeicao.descricao
        }
      })

      if (!refeicaoExistente) {
        await prisma.refeicao.create({
          data: {
            usuarioId,
            horario: refeicao.horario,
            descricao: refeicao.descricao
          }
        })
        refeicoesMigradas++
      } else {
        logger.info(`Refeição planejada "${refeicao.descricao}" às ${refeicao.horario} já existe. Ignorando.`);
        refeicoesIgnoradas++
      }
    } catch (erro) {
      logger.error(`Erro ao migrar refeição planejada com ID local ${refeicao.id}:`, erro)
      refeicoesFalhas++
      if (erro instanceof Error) {
          resultado.erros.push({ tipo: 'RefeicaoPlanejada', idLocal: refeicao.id, mensagem: erro.message });
      } else {
          resultado.erros.push({ tipo: 'RefeicaoPlanejada', idLocal: refeicao.id, erro });
      }
    }
  }

  // Migrar Registros de Refeições
  logger.info(`Migrando ${alimentacaoStore.registros.length} registros de refeições...`)
  for (const registro of alimentacaoStore.registros) {
    try {
      const data = new Date(registro.data)

      if (isNaN(data.getTime())) {
          logger.warn(`Registro de refeição com ID local ${registro.id} possui data inválida. Ignorando.`);
          registrosIgnorados++;
          continue;
      }

      const registroExistente = await prisma.registroRefeicao.findFirst({
        where: {
          usuarioId,
          data,
          horario: registro.horario,
          descricao: registro.descricao
        }
      })

      if (!registroExistente) {
        await prisma.registroRefeicao.create({
          data: {
            usuarioId,
            data,
            horario: registro.horario,
            descricao: registro.descricao,
            tipoIcone: registro.tipoIcone,
            foto: registro.foto
          }
        })
        registrosMigrados++
      } else {
         logger.info(`Registro de refeição "${registro.descricao}" em ${data.toISOString()} às ${registro.horario} já existe. Ignorando.`);
        registrosIgnorados++
      }
    } catch (erro) {
      logger.error(`Erro ao migrar registro de refeição com ID local ${registro.id}:`, erro)
      registrosFalhas++
      if (erro instanceof Error) {
          resultado.erros.push({ tipo: 'RegistroRefeicao', idLocal: registro.id, mensagem: erro.message });
      } else {
          resultado.erros.push({ tipo: 'RegistroRefeicao', idLocal: registro.id, erro });
      }
    }
  }

  resultado.migrados = refeicoesMigradas + registrosMigrados;
  resultado.ignorados = refeicoesIgnoradas + registrosIgnorados;
  resultado.falhas = refeicoesFalhas + registrosFalhas;

  if (resultado.falhas === 0) {
    resultado.sucesso = true
    resultado.mensagem = `Dados de alimentação migrados: ${refeicoesMigradas} planejadas, ${registrosMigrados} registros. Ignorados: ${refeicoesIgnoradas} planejadas, ${registrosIgnorados} registros.`
    logger.info(resultado.mensagem)
  } else {
    resultado.sucesso = false
    resultado.mensagem = `Erro ao migrar dados de alimentação. Falhas: ${refeicoesFalhas} planejadas, ${registrosFalhas} registros.`
    logger.error(resultado.mensagem)
  }

  return resultado
}

/**
 * Migra as receitas para o banco de dados
 * @param usuarioId ID do usuário no banco de dados
 */
export async function migrarReceitas(usuarioId: string): Promise<ResultadoMigracaoModulo> {
  logger.info(`Iniciando migração de receitas para usuário ID: ${usuarioId}`)
  const receitasStore = useReceitasStore.getState()
  const resultado: ResultadoMigracaoModulo = { sucesso: false, mensagem: '', migrados: 0, ignorados: 0, falhas: 0, erros: [] }
  let receitasMigradas = 0
  let receitasIgnoradas = 0
  let receitasFalhas = 0
  let favoritosMigrados = 0
  let favoritosIgnorados = 0
  let favoritosFalhas = 0

  const receitasCriadasMap = new Map<string, string>(); // Mapeia ID local para ID do DB

  // Migrar Receitas
  logger.info(`Migrando ${receitasStore.receitas.length} receitas...`)
  for (const receita of receitasStore.receitas) {
    try {
      const receitaExistente = await prisma.receita.findFirst({
        where: {
          usuarioId,
          nome: receita.nome // Usar nome como chave única para evitar duplicatas
        }
      })

      if (!receitaExistente) {
        const novaReceita = await prisma.receita.create({
          data: {
            usuarioId,
            nome: receita.nome,
            descricao: receita.descricao,
            categorias: receita.categorias,
            tags: receita.tags,
            tempoPreparo: receita.tempoPreparo,
            porcoes: receita.porcoes,
            calorias: receita.calorias,
            imagem: receita.imagem,
            ingredientes: {
              create: receita.ingredientes.map(ingrediente => ({
                nome: ingrediente.nome,
                quantidade: ingrediente.quantidade,
                unidade: ingrediente.unidade
              }))
            },
            passos: {
              create: receita.passos.map((passo, index) => ({
                ordem: index + 1,
                descricao: passo
              }))
            }
          }
        })
        receitasMigradas++
        receitasCriadasMap.set(receita.id, novaReceita.id); // Armazena o mapeamento de ID
      } else {
        logger.info(`Receita "${receita.nome}" já existe. Ignorando.`);
        receitasIgnoradas++
        receitasCriadasMap.set(receita.id, receitaExistente.id); // Armazena mapeamento mesmo se ignorado
      }
    } catch (erro) {
      logger.error(`Erro ao migrar receita com ID local ${receita.id} ("${receita.nome}"):`, erro)
      receitasFalhas++
      if (erro instanceof Error) {
          resultado.erros.push({ tipo: 'Receita', idLocal: receita.id, nome: receita.nome, mensagem: erro.message });
      } else {
          resultado.erros.push({ tipo: 'Receita', idLocal: receita.id, nome: receita.nome, erro });
      }
    }
  }

  // Migrar Favoritos
  logger.info(`Migrando ${receitasStore.favoritos.length} favoritos...`)
  for (const favoritoIdLocal of receitasStore.favoritos) {
    try {
        const receitaIdDb = receitasCriadasMap.get(favoritoIdLocal);

        if (!receitaIdDb) {
            logger.warn(`Não foi possível encontrar o ID da receita no DB correspondente ao ID local ${favoritoIdLocal} para migrar favorito. Ignorando.`);
            favoritosIgnorados++;
            continue;
        }

      const favoritoExistente = await prisma.receitaFavorita.findUnique({
        where: {
          usuarioId_receitaId: { // Usando o índice único definido no schema
            usuarioId,
            receitaId: receitaIdDb
          }
        }
      })

      if (!favoritoExistente) {
        await prisma.receitaFavorita.create({
          data: {
            usuarioId,
            receitaId: receitaIdDb
          }
        })
        favoritosMigrados++
      } else {
        logger.info(`Receita com ID ${receitaIdDb} já está nos favoritos. Ignorando.`);
        favoritosIgnorados++
      }
    } catch (erro) {
      logger.error(`Erro ao migrar favorito com ID local de receita ${favoritoIdLocal}:`, erro)
      favoritosFalhas++
      if (erro instanceof Error) {
          resultado.erros.push({ tipo: 'Favorito', idLocalReceita: favoritoIdLocal, mensagem: erro.message });
      } else {
          resultado.erros.push({ tipo: 'Favorito', idLocalReceita: favoritoIdLocal, erro });
      }
    }
  }

  resultado.migrados = receitasMigradas + favoritosMigrados;
  resultado.ignorados = receitasIgnoradas + favoritosIgnorados;
  resultado.falhas = receitasFalhas + favoritosFalhas;

  if (resultado.falhas === 0) {
    resultado.sucesso = true
    resultado.mensagem = `Dados de receitas migrados: ${receitasMigradas} receitas, ${favoritosMigrados} favoritos. Ignorados: ${receitasIgnoradas} receitas, ${favoritosIgnorados} favoritos.`
    logger.info(resultado.mensagem)
  } else {
    resultado.sucesso = false
    resultado.mensagem = `Erro ao migrar dados de receitas. Falhas: ${receitasFalhas} receitas, ${favoritosFalhas} favoritos.`
    logger.error(resultado.mensagem)
  }

  return resultado
}


/**
 * Migra todos os dados para o banco de dados
 * @param usuarioId ID do usuário no banco de dados
 * @param email Email do usuário
 */
export async function migrarTodosDados(usuarioId: string, email: string): Promise<{
    sucesso: boolean;
    mensagem: string;
    detalhes?: { [key: string]: ResultadoMigracaoModulo };
    erro?: any;
}> {
  logger.info(`--- Iniciando migração completa para usuário ID: ${usuarioId}, Email: ${email} ---`)
  const resultados: { [key: string]: ResultadoMigracaoModulo } = {};
  let sucessoGeral = true;

  try {
    // Migra o perfil primeiro
    resultados.perfil = await migrarPerfil(usuarioId, email)
    if (!resultados.perfil.sucesso) sucessoGeral = false;

    // Migra os dados de sono
    resultados.sono = await migrarRegistrosSono(usuarioId)
     if (!resultados.sono.sucesso) sucessoGeral = false;

    // Migra os dados de alimentação
    resultados.alimentacao = await migrarDadosAlimentacao(usuarioId)
     if (!resultados.alimentacao.sucesso) sucessoGeral = false;

    // Migra as receitas
    resultados.receitas = await migrarReceitas(usuarioId)
     if (!resultados.receitas.sucesso) sucessoGeral = false;

    if (sucessoGeral) {
        logger.info(`--- Migração completa para usuário ${usuarioId} concluída com sucesso. ---`)
        return {
            sucesso: true,
            mensagem: 'Todos os dados foram migrados com sucesso.',
            detalhes: resultados
        }
    } else {
         logger.error(`--- Migração completa para usuário ${usuarioId} concluída com falhas. ---`)
         return {
            sucesso: false,
            mensagem: 'Migração concluída com uma ou mais falhas. Verifique os detalhes.',
            detalhes: resultados
        }
    }

  } catch (erro) {
    logger.error(`--- Erro GERAL e inesperado durante a migração completa para usuário ${usuarioId}:`, erro)
    return {
      sucesso: false,
      mensagem: 'Erro geral e inesperado durante a migração.',
      detalhes: resultados, // Retorna os resultados parciais
      erro: erro instanceof Error ? { mensagem: erro.message, stack: erro.stack } : erro
    }
  }
}