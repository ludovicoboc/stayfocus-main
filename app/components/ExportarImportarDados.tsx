'use client';

import React from 'react';
import { SyncStatusUnified } from './SyncStatusUnified';
import { Info } from 'lucide-react';

/**
 * Componente simplificado focado em sincronização automática
 * Remove botões manuais redundantes e foca na experiência automática
 */
export const ExportarImportarDados = () => {
  return (
    <div className="space-y-6">
      {/* Componente principal de sincronização */}
      <SyncStatusUnified />
      
      {/* Informações sobre backup local (apenas informativo) */}
      <div className="max-w-2xl mx-auto">
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                Backup Local Removido
              </div>
              <div className="text-amber-700 dark:text-amber-300 space-y-1">
                <p>O backup manual foi substituído pela sincronização automática com Google Drive.</p>
                <p>Seus dados são salvos automaticamente na nuvem e funcionam offline.</p>
                <p>Não é mais necessário fazer backup manual - tudo acontece automaticamente!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
