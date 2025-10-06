'use client';

import { useMemo } from 'react';
import { usePainelDiaStore } from '@/app/stores/painelDiaStore';
import { usePrioridadesStore } from '@/app/stores/prioridadesStore';
import { usePerfilStore } from '@/app/stores/perfilStore';

/**
 * Hook para agregar e processar dados de várias stores para o painel principal.
 * Ele simplifica o acesso aos dados do dashboard, combinando informações
 * de perfil, blocos de tempo e prioridades.
 */
export const useDashboard = () => {
  // --- 1. Consumir dados das stores ---
  const {
    blocos,
    isLoading: isLoadingPainel
  } = usePainelDiaStore();

  const {
    getHistoricoPorData,
    isLoading: isLoadingPrioridades
  } = usePrioridadesStore();
  
  const { 
    nome, 
    metasDiarias, 
    pausasAtivas, 
    preferenciasVisuais,
    isLoading: isLoadingPerfil
  } = usePerfilStore();

  // --- 2. Processar e derivar dados ---
  // Usar useMemo para otimizar cálculos que não precisam ser refeitos a cada renderização.
  const {
    prioridadesDia,
    prioridadesPendentes,
    prioridadesConcluidas,
    proximosCompromissos,
  } = useMemo(() => {
    // Obter prioridades do dia atual
    const dataAtual = new Date().toISOString().split('T')[0];
    const prioridadesDoDia = getHistoricoPorData(dataAtual);
    
    // Calcular estatísticas de prioridades
    const pendentes = prioridadesDoDia.filter(p => !p.concluida).length;
    const concluidas = prioridadesDoDia.filter(p => p.concluida).length;

    // Calcular próximos compromissos (próximos 3 blocos)
    const agora = new Date();
    const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
    const blocosFuturos = blocos
      .filter(bloco => bloco.hora >= horaAtual)
      .slice(0, 3); // Já vêm ordenados da store

    return {
      prioridadesDia: prioridadesDoDia,
      prioridadesPendentes: pendentes,
      prioridadesConcluidas: concluidas,
      proximosCompromissos: blocosFuturos,
    };
  }, [blocos, getHistoricoPorData]);

  // --- 3. Determinar o estado de carregamento agregado ---
  const isLoading = isLoadingPainel || isLoadingPrioridades || isLoadingPerfil;

  // --- 4. Retornar a estrutura de dados consolidada ---
  return {
    // Dados diretos das stores
    blocosDia: blocos,
    nomeUsuario: nome,
    preferenciasVisuais,
    metasPausas: metasDiarias.pausasProgramadas,
    metasPrioridades: metasDiarias.tarefasPrioritarias,
    mostrarPausas: pausasAtivas,

    // Dados derivados e calculados
    prioridadesDia,
    proximosCompromissos,
    prioridadesPendentes,
    prioridadesConcluidas,

    // Estado de carregamento
    isLoading,
  };
};