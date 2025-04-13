/**
 * Serviço para exportação e importação de dados do StayFocus
 * Permite que usuários façam backup de seus dados e os restaurem quando necessário
 */

// Importações das stores
import { useFinancasStore } from '../stores/financasStore';
import { useAlimentacaoStore } from '../stores/alimentacaoStore';
import { useAutoconhecimentoStore } from '../stores/autoconhecimentoStore';
import { useHiperfocosStore } from '../stores/hiperfocosStore';
import { usePainelDiaStore } from '../stores/painelDiaStore';
import { usePerfilStore } from '../stores/perfilStore';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { usePrioridadesStore } from '../stores/prioridadesStore';
import { useRegistroEstudosStore } from '../stores/registroEstudosStore';
import { useSonoStore } from '../stores/sonoStore';
import { useAtividadesStore } from '../stores/atividadesStore';
import { useHistoricoSimuladosStore } from '../stores/historicoSimuladosStore'; // <-- Importar novo store
import { useAppStore } from '../store'; // Store global que contém dados de saúde e lazer

/**
 * Coleta todos os dados das stores para exportação.
 * @returns O objeto de dados pronto para ser serializado ou null em caso de erro.
 */
const coletarDadosParaExportar = (): object | null => {
  try {
    const financas = useFinancasStore.getState();
    const alimentacao = useAlimentacaoStore.getState();
    const autoconhecimento = useAutoconhecimentoStore.getState();
    const hiperfocos = useHiperfocosStore.getState();
    const painelDia = usePainelDiaStore.getState();
    const perfil = usePerfilStore.getState();
    const pomodoro = usePomodoroStore.getState();
    const prioridades = usePrioridadesStore.getState();
    const registroEstudos = useRegistroEstudosStore.getState();
    const sono = useSonoStore.getState();
    const atividades = useAtividadesStore.getState();
    const historicoSimulados = useHistoricoSimuladosStore.getState(); // <-- Coletar estado do histórico
    const appGlobal = useAppStore.getState();

    return {
      versao: '1.1', // <-- Incrementar versão para indicar mudança na estrutura de dados
      timestamp: new Date().toISOString(),
      dados: { // <-- Bloco de dados correto começa aqui
        financas: limparFuncoesDoObjeto(financas),
        alimentacao: limparFuncoesDoObjeto(alimentacao),
        autoconhecimento: limparFuncoesDoObjeto(autoconhecimento),
        hiperfocos: limparFuncoesDoObjeto(hiperfocos),
        painelDia: limparFuncoesDoObjeto(painelDia),
        perfil: limparFuncoesDoObjeto(perfil),
        pomodoro: limparFuncoesDoObjeto(pomodoro),
        prioridades: limparFuncoesDoObjeto(prioridades),
        registroEstudos: limparFuncoesDoObjeto(registroEstudos),
        sono: limparFuncoesDoObjeto(sono),
        atividades: limparFuncoesDoObjeto(atividades),
        historicoSimulados: limparFuncoesDoObjeto(historicoSimulados), // <-- Incluir histórico nos dados (linha única)
        appGlobal: limparFuncoesDoObjeto(appGlobal),
      } // <-- Fechamento correto do bloco 'dados'
    };
  } catch (error) {
    console.error('Erro ao coletar dados para exportação:', error);
    return null;
  }
};

/**
 * Exporta os dados e dispara o download do arquivo JSON.
 * Usado para exportação local.
 * @returns Objeto com informação de sucesso ou erro.
 */
export const exportarDadosParaArquivo = (): { sucesso: boolean; mensagem?: string; erro?: string } => {
  const dadosExportados = coletarDadosParaExportar();
  if (!dadosExportados) {
    return { sucesso: false, erro: 'Falha ao coletar dados para exportação.' };
  }

  try {
    triggerJsonDownload(dadosExportados, 'stayfocus_backup');
    return { sucesso: true, mensagem: 'Download do backup iniciado.' };
  } catch (error: any) {
    console.error('Erro ao disparar download do JSON:', error);
    return { sucesso: false, erro: `Erro ao criar arquivo de backup: ${error.message}` };
  }
};

/**
 * Retorna o objeto de dados para ser enviado para APIs (ex: Google Drive).
 * @returns O objeto de dados ou null em caso de erro.
 */
export const obterDadosParaExportar = (): object | null => {
  return coletarDadosParaExportar();
};


/**
 * Helper para disparar o download de um objeto como arquivo JSON.
 * @param dataObject O objeto a ser baixado.
 * @param baseFilename O nome base para o arquivo (timestamp será adicionado).
 */
export const triggerJsonDownload = (dataObject: any, baseFilename: string) => {
  const jsonString = JSON.stringify(dataObject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const timestamp = dataObject.timestamp || new Date().toISOString();
  const dataFormatada = timestamp.split('T')[0];
  const link = document.createElement('a');
  link.href = url;
  link.download = `${baseFilename}_${dataFormatada}.json`;
  document.body.appendChild(link); // Necessário para Firefox
  link.click();
  document.body.removeChild(link); // Limpar
  URL.revokeObjectURL(url);
};


/**
 * Limpa as funções de um objeto para exportação JSON.
 * @param obj Objeto a ser limpo.
 * @returns Objeto sem funções
 */
const limparFuncoesDoObjeto = (obj: Record<string, any>): Record<string, any> => {
  // Criar cópia do objeto
  const resultado = {...obj};
  
  // Remover todas as funções pois não podem ser serializadas em JSON
  Object.keys(resultado).forEach(key => {
    if (typeof resultado[key] === 'function') {
      delete resultado[key];
    }
  });
  
  return resultado;
};

/**
 * Valida a estrutura básica de dados importados.
 * @param dados Dados a serem validados.
 * @returns Objeto com informação de validade e possível erro.
 */
const validarDadosImportados = (dados: any): { valido: boolean; erro?: string; timestamp?: string } => {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, erro: 'Dados inválidos ou não são um objeto.' };
  }
  if (!dados.versao || !dados.timestamp || !dados.dados) {
    return { valido: false, erro: 'Formato de arquivo inválido: Faltam propriedades essenciais (versao, timestamp, dados).' };
  } // <-- Fechar o primeiro IF aqui

  // Validar a versão
  if (dados.versao !== '1.0' && dados.versao !== '1.1') {
    return { valido: false, erro: `Versão incompatível: ${dados.versao}. Esperada: 1.0 ou 1.1` };
  }

  // Validar a seção 'dados'
  if (typeof dados.dados !== 'object' || Object.keys(dados.dados).length === 0) {
    return { valido: false, erro: 'Seção "dados" está vazia ou inválida.' };
  }

  return { valido: true, timestamp: dados.timestamp };
};

/**
 * Aplica os dados importados (já validados) às stores Zustand.
 * @param dadosImportados Objeto contendo os dados dos módulos.
 */
const _applyImportedData = (dadosImportados: any) => {
  // Helper para aplicar estado a uma store
  const applyState = (storeSetter: (partialState: any) => void, data: any) => {
    if (data && typeof data === 'object') {
      // Limpar funções novamente por segurança, caso existam no JSON por algum motivo
      const cleanedData = limparFuncoesDoObjeto(data);
      // Add explicit 'any' type for state parameter
      storeSetter((state: any) => ({ 
        ...state,
        ...cleanedData
      }));
    }
  };

  // Aplicar dados a cada store se existirem no objeto importado
  applyState(useFinancasStore.setState, dadosImportados.financas);
  applyState(useAlimentacaoStore.setState, dadosImportados.alimentacao);
  applyState(useAutoconhecimentoStore.setState, dadosImportados.autoconhecimento);
  applyState(useHiperfocosStore.setState, dadosImportados.hiperfocos);
  applyState(usePainelDiaStore.setState, dadosImportados.painelDia);
  applyState(usePerfilStore.setState, dadosImportados.perfil);
  applyState(usePomodoroStore.setState, dadosImportados.pomodoro);
  applyState(usePrioridadesStore.setState, dadosImportados.prioridades);
  applyState(useRegistroEstudosStore.setState, dadosImportados.registroEstudos);
  applyState(useSonoStore.setState, dadosImportados.sono);
  applyState(useAtividadesStore.setState, dadosImportados.atividades);
  // Aplicar histórico apenas se existir nos dados importados (compatibilidade com v1.0)
  if (dadosImportados.historicoSimulados) {
    applyState(useHistoricoSimuladosStore.setState, dadosImportados.historicoSimulados); // <-- Restaurar histórico
  }
  applyState(useAppStore.setState, dadosImportados.appGlobal);
};


/**
 * Importa dados de um arquivo JSON local.
 * @param arquivo Arquivo File selecionado pelo usuário.
 * @returns Objeto com resultado da importação.
 */
export const importarDadosDeArquivo = async (arquivo: File): Promise<{ sucesso: boolean; mensagem?: string; timestamp?: string; erro?: string }> => {
  try {
    const texto = await arquivo.text();
    const dados = JSON.parse(texto);

    // Validar dados
    const validacao = validarDadosImportados(dados);
    if (!validacao.valido) {
      return { sucesso: false, erro: validacao.erro ?? 'Erro de validação desconhecido.' };
    }

    // Aplicar dados aos stores
    _applyImportedData(dados.dados);

    return {
      sucesso: true,
      mensagem: 'Dados importados com sucesso do arquivo.',
      timestamp: validacao.timestamp
    };
  } catch (error: any) {
    console.error('Erro ao importar dados do arquivo:', error);
    return {
      sucesso: false,
      erro: `Erro ao importar dados do arquivo: ${error.message}`
    };
  }
};

/**
 * Importa dados de um objeto JavaScript (ex: vindo de uma API).
 * @param dataObject Objeto contendo a estrutura de dados exportada ({ versao, timestamp, dados }).
 * @returns Objeto com resultado da importação.
 */
export const importarDadosFromObject = (dataObject: any): { sucesso: boolean; mensagem?: string; timestamp?: string; erro?: string } => {
  try {
    // Validar dados
    const validacao = validarDadosImportados(dataObject);
    if (!validacao.valido) {
      return { sucesso: false, erro: validacao.erro ?? 'Erro de validação desconhecido.' };
    }

    // Aplicar dados aos stores
    _applyImportedData(dataObject.dados);

    return {
      sucesso: true,
      mensagem: 'Dados importados com sucesso.',
      timestamp: validacao.timestamp
    };
  } catch (error: any) {
    console.error('Erro ao importar dados do objeto:', error);
    return {
      sucesso: false,
      erro: `Erro ao importar dados: ${error.message}`
    };
  }
};
