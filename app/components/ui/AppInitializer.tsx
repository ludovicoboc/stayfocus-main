'use client';

import { useEffect } from 'react';
import { usePerfilStore } from '@/app/stores/perfilStore';
import { usePainelDiaStore } from '@/app/stores/painelDiaStore';
import { usePrioridadesStore } from '@/app/stores/prioridadesStore';
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore';
import { useRegistroEstudosStore } from '@/app/stores/registroEstudosStore';
import { useMedicamentosStore } from '@/app/stores/medicamentosStore';
import { useHumorStore } from '@/app/stores/humorStore';
import { useFinancasStore } from '@/app/stores/financasStore';
import { useHiperfocosStore } from '@/app/stores/hiperfocosStore';
import { useConcursosStore } from '@/app/stores/concursosStore';
import { useAtividadesStore } from '@/app/stores/atividadesStore';
import { useSugestoesStore } from '@/app/stores/sugestoesStore';
import { useAutoconhecimentoStore } from '@/app/stores/autoconhecimentoStore';
import { useSonoStore } from '@/app/stores/sonoStore';

// Este componente não renderiza nada. Seu único propósito é
// acionar a inicialização de todas as stores que dependem de dados do servidor.
export function AppInitializer() {
  const { initialize: initializePerfil, isInitialized: isPerfilInitialized } = usePerfilStore();
  const { initialize: initializePainel, isInitialized: isPainelInitialized } = usePainelDiaStore();
  const { initialize: initializePrioridades, isInitialized: isPrioridadesInitialized } = usePrioridadesStore();
  const { initialize: initializeAlimentacao, isInitialized: isAlimentacaoInitialized } = useAlimentacaoStore();
  const { initialize: initializeEstudos, isInitialized: isEstudosInitialized } = useRegistroEstudosStore();
  const { initialize: initializeMedicamentos, isInitialized: isMedicamentosInitialized } = useMedicamentosStore();
  const { initialize: initializeHumor, isInitialized: isHumorInitialized } = useHumorStore();
  const { initialize: initializeFinancas, isInitialized: isFinancasInitialized } = useFinancasStore();
  const { initialize: initializeHiperfocos, isInitialized: isHiperfocosInitialized } = useHiperfocosStore();
  const { initialize: initializeConcursos, isInitialized: isConcursosInitialized } = useConcursosStore();
  const { initialize: initializeAtividades, isInitialized: isAtividadesInitialized } = useAtividadesStore();
  const { initialize: initializeSugestoes, isInitialized: isSugestoesInitialized } = useSugestoesStore();
  const { initialize: initializeAutoconhecimento, isInitialized: isAutoconhecimentoInitialized } = useAutoconhecimentoStore();
  const { initialize: initializeSono, isInitialized: isSonoInitialized } = useSonoStore();

  useEffect(() => {
    // Inicializa cada store se ainda não foi feito
    if (!isPerfilInitialized) initializePerfil();
    if (!isPainelInitialized) initializePainel();
    if (!isPrioridadesInitialized) initializePrioridades();
    if (!isAlimentacaoInitialized) initializeAlimentacao();
    if (!isEstudosInitialized) initializeEstudos();
    if (!isMedicamentosInitialized) initializeMedicamentos();
    if (!isHumorInitialized) initializeHumor();
    if (!isFinancasInitialized) initializeFinancas();
    if (!isHiperfocosInitialized) initializeHiperfocos();
    if (!isConcursosInitialized) initializeConcursos();
    if (!isAtividadesInitialized) initializeAtividades();
    if (!isSugestoesInitialized) initializeSugestoes();
    if (!isAutoconhecimentoInitialized) initializeAutoconhecimento();
    if (!isSonoInitialized) initializeSono();

  }, [
    initializePerfil, isPerfilInitialized,
    initializePainel, isPainelInitialized,
    initializePrioridades, isPrioridadesInitialized,
    initializeAlimentacao, isAlimentacaoInitialized,
    initializeEstudos, isEstudosInitialized,
    initializeMedicamentos, isMedicamentosInitialized,
    initializeHumor, isHumorInitialized,
    initializeFinancas, isFinancasInitialized,
    initializeHiperfocos, isHiperfocosInitialized,
    initializeConcursos, isConcursosInitialized,
    initializeAtividades, isAtividadesInitialized,
    initializeSugestoes, isSugestoesInitialized,
    initializeAutoconhecimento, isAutoconhecimentoInitialized,
    initializeSono, isSonoInitialized
  ]);

  return null; // Não renderiza nada na UI
}