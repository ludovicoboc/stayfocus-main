'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
// Import updated/new functions from dataService
import { 
  exportarDadosParaArquivo, 
  importarDadosDeArquivo, 
  obterDadosParaExportar,
  importarDadosFromObject 
} from '../lib/dataService'; 
import { useDataTransferStore } from '../stores/dataTransferStore';
// Import new icons
import { Download, Upload, AlertCircle, CheckCircle, Info, Clock, HelpCircle, LogIn, LogOut, Save, FolderOpen, Loader2 } from 'lucide-react'; 
import Link from 'next/link';
import { Button } from './ui/Button'; // Assuming Button component exists
import { Modal } from './ui/Modal'; // Assuming Modal component exists

// Define the type for Google Drive files listed
interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  createdTime: string;
}

/**
 * Componente para exportar e importar dados do aplicativo localmente ou via Google Drive.
 */
export const ExportarImportarDados = () => {
  const [status, setStatus] = useState<'idle' | 'exporting' | 'importing' | 'success' | 'error'>('idle');
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<'success' | 'error' | 'info'>('info');
  
  // Local file handling state
  const [mostrarConfirmacaoLocal, setMostrarConfirmacaoLocal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [arquivoSelecionadoLocal, setArquivoSelecionadoLocal] = useState<File | null>(null);

  // Google Drive state
  const [isDriveAuthenticated, setIsDriveAuthenticated] = useState(false);
  const [isLoadingAuthCheck, setIsLoadingAuthCheck] = useState(true);
  const [isLoadingDriveAction, setIsLoadingDriveAction] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [showDriveFilesModal, setShowDriveFilesModal] = useState(false);
  const [mostrarConfirmacaoDrive, setMostrarConfirmacaoDrive] = useState(false);
  const [dadosParaImportarDrive, setDadosParaImportarDrive] = useState<any>(null);
  const [timestampImportacaoDrive, setTimestampImportacaoDrive] = useState<string | undefined>(undefined);
  
  // Zustand store access
  const { 
    ultimaExportacao, 
    ultimaImportacao, 
    registrarExportacao, 
    registrarImportacao 
  } = useDataTransferStore();
  
  // --- Utility Functions ---

  const formatarData = (dataIso: string | null): string | null => {
    if (!dataIso) return null;
    try {
      const data = new Date(dataIso);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", dataIso, e);
      return dataIso; // Return original string if formatting fails
    }
  };

  const clearMessage = useCallback(() => {
    setTimeout(() => {
      if (status !== 'exporting' && status !== 'importing' && !isLoadingDriveAction && !isLoadingAuthCheck) {
         setStatus('idle');
         setMensagem('');
         setTipoMensagem('info');
      }
    }, 5000); // Increased timeout
  }, [status, isLoadingDriveAction, isLoadingAuthCheck]);

  const showStatusMessage = (msg: string, type: 'success' | 'error' | 'info', currentStatus: 'idle' | 'exporting' | 'importing' | 'success' | 'error') => {
    setMensagem(msg);
    setTipoMensagem(type);
    setStatus(currentStatus);
    clearMessage();
  };

  // --- Google Drive Auth Check ---
  const checkDriveAuth = useCallback(async () => {
    setIsLoadingAuthCheck(true);
    try {
      const response = await fetch('/api/drive/checkAuth');
      if (!response.ok) throw new Error('Failed to check auth status');
      const data = await response.json();
      setIsDriveAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error('Erro ao verificar autenticação do Drive:', error);
      setIsDriveAuthenticated(false);
      showStatusMessage('Erro ao verificar conexão com Google Drive.', 'error', 'error');
    } finally {
      setIsLoadingAuthCheck(false);
    }
  }, []); // Dependencies are stable

  useEffect(() => {
    checkDriveAuth();
  }, [checkDriveAuth]);
  
  // --- Local File Handlers ---

  const handleExportarLocal = () => {
    setStatus('exporting');
    showStatusMessage('Exportando dados para arquivo local...', 'info', 'exporting');
    try {
      const resultado = exportarDadosParaArquivo(); 
      if (resultado.sucesso) {
        showStatusMessage(resultado.mensagem || 'Dados exportados com sucesso!', 'success', 'success');
        registrarExportacao(); 
      } else {
        throw new Error(resultado.erro || 'Erro desconhecido na exportação');
      }
    } catch (error: any) {
      showStatusMessage(`Erro ao exportar localmente: ${error.message}`, 'error', 'error');
    }
  };

  const handleSelecionarArquivoLocal = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = evento.target.files;
    if (!arquivos || arquivos.length === 0) return;
    const arquivo = arquivos[0];
    setArquivoSelecionadoLocal(arquivo);
    setMostrarConfirmacaoLocal(true);
    setMostrarConfirmacaoDrive(false); // Ensure only one confirmation shows
  };
  
  const cancelarImportacaoLocal = () => {
    setArquivoSelecionadoLocal(null);
    setMostrarConfirmacaoLocal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const confirmarImportacaoLocal = async () => {
    if (!arquivoSelecionadoLocal) return;
    
    setStatus('importing');
    showStatusMessage('Importando dados do arquivo local...', 'info', 'importing');
    setMostrarConfirmacaoLocal(false);
    
    try {
      const resultado = await importarDadosDeArquivo(arquivoSelecionadoLocal); 
      if (resultado.sucesso) {
        registrarImportacao(resultado.timestamp); 
        const dataFormatada = formatarData(resultado.timestamp || null);
        showStatusMessage(`Dados importados com sucesso! (Backup local de ${dataFormatada})`, 'success', 'success');
      } else {
        throw new Error(resultado.erro || 'Erro desconhecido na importação');
      }
    } catch (error: any) {
      showStatusMessage(`Erro ao importar localmente: ${error.message}`, 'error', 'error');
    } finally {
       cancelarImportacaoLocal(); // Clear selection
    }
  };

  // --- Google Drive Handlers ---

  const handleConnectDrive = () => {
    window.location.href = '/api/auth/google/connect';
  };

  const handleDisconnectDrive = async () => {
    setIsLoadingDriveAction(true);
    showStatusMessage('Desconectando do Google Drive...', 'info', 'importing');
    try {
      const response = await fetch('/api/auth/google/disconnect', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao desconectar');
      }
      setIsDriveAuthenticated(false);
      showStatusMessage('Desconectado do Google Drive com sucesso.', 'success', 'success');
    } catch (error: any) {
      console.error('Erro ao desconectar do Drive:', error);
      showStatusMessage(`Erro ao desconectar: ${error.message}`, 'error', 'error');
    } finally {
      setIsLoadingDriveAction(false);
    }
  };

  const handleSaveToDrive = async () => {
    setIsLoadingDriveAction(true);
    showStatusMessage('Salvando backup no Google Drive...', 'info', 'exporting');
    
    const dadosParaSalvar = obterDadosParaExportar();
    if (!dadosParaSalvar) {
      showStatusMessage('Erro ao coletar dados para salvar.', 'error', 'error');
      setIsLoadingDriveAction(false);
      return;
    }

    try {
      const response = await fetch('/api/drive/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaSalvar),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar no Drive');
      }
      
      const result = await response.json();
      showStatusMessage(`Backup salvo com sucesso no Google Drive: ${result.fileName}`, 'success', 'success');
      registrarExportacao(); 
    } catch (error: any) {
      console.error('Erro ao salvar no Drive:', error);
      showStatusMessage(`Erro ao salvar no Drive: ${error.message}`, 'error', 'error');
    } finally {
      setIsLoadingDriveAction(false);
    }
  };

  const handleLoadFromDrive = async () => {
    setIsLoadingDriveAction(true);
    showStatusMessage('Buscando backups no Google Drive...', 'info', 'importing');
    try {
      const response = await fetch('/api/drive/list');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao listar arquivos do Drive');
      }
      const result = await response.json();
      if (result.success && result.files && result.files.length > 0) {
        setDriveFiles(result.files);
        setShowDriveFilesModal(true);
        // Clear loading message, modal will show results
        setMensagem(''); 
        setStatus('idle');
      } else {
        showStatusMessage('Nenhum arquivo de backup encontrado no Google Drive.', 'info', 'idle');
      }
    } catch (error: any) {
      console.error('Erro ao listar arquivos do Drive:', error);
      showStatusMessage(`Erro ao buscar backups: ${error.message}`, 'error', 'error');
    } finally {
      setIsLoadingDriveAction(false);
    }
  };

  const selectDriveFileToLoad = async (fileId: string) => {
    setShowDriveFilesModal(false);
    setIsLoadingDriveAction(true);
    showStatusMessage(`Carregando backup ${fileId} do Google Drive...`, 'info', 'importing');
    try {
      const response = await fetch(`/api/drive/load?fileId=${fileId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao carregar arquivo do Drive');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setDadosParaImportarDrive(result.data); 
        setTimestampImportacaoDrive(result.data.timestamp); 
        setMostrarConfirmacaoDrive(true); 
        setMostrarConfirmacaoLocal(false);
        // Clear loading message, confirmation dialog will show
        setMensagem(''); 
        setStatus('idle');
      } else {
        throw new Error('Dados inválidos recebidos do backup do Drive.');
      }
    } catch (error: any) {
      console.error('Erro ao carregar arquivo do Drive:', error);
      showStatusMessage(`Erro ao carregar backup: ${error.message}`, 'error', 'error');
    } finally {
      setIsLoadingDriveAction(false);
    }
  };

  const cancelarImportacaoDrive = () => {
    setDadosParaImportarDrive(null);
    setTimestampImportacaoDrive(undefined);
    setMostrarConfirmacaoDrive(false);
  };

  const confirmarImportacaoDrive = () => {
    if (!dadosParaImportarDrive) return;

    setStatus('importing');
    showStatusMessage('Importando dados do Google Drive...', 'info', 'importing');
    setMostrarConfirmacaoDrive(false);

    try {
      const resultado = importarDadosFromObject(dadosParaImportarDrive); 
      if (resultado.sucesso) {
        registrarImportacao(resultado.timestamp); 
        const dataFormatada = formatarData(resultado.timestamp || null);
        showStatusMessage(`Dados importados com sucesso! (Backup do Drive de ${dataFormatada})`, 'success', 'success');
      } else {
        throw new Error(resultado.erro || 'Erro desconhecido na importação do Drive');
      }
    } catch (error: any) {
      showStatusMessage(`Erro ao importar do Drive: ${error.message}`, 'error', 'error');
    } finally {
      setDadosParaImportarDrive(null); 
      setTimestampImportacaoDrive(undefined);
    }
  };

  // --- Render Logic ---
  const isLoading = status === 'exporting' || status === 'importing' || isLoadingAuthCheck || isLoadingDriveAction;

  return (
    <>
      {/* Main Component Card */}
      <div className="w-full max-w-lg mx-auto bg-card text-card-foreground rounded-lg shadow-md p-6 border">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Backup Local e Google Drive</h2>
            <Link href="/perfil/ajuda" className="text-primary hover:underline flex items-center" title="Ajuda">
              <HelpCircle size={16} />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Faça backup local ou no Google Drive, e restaure seus dados.
          </p>
        </div>
        
        {/* Global Status Message Area */}
        {mensagem && (
          <div className={`mb-4 flex items-start gap-3 p-3 rounded-md text-sm border ${
            tipoMensagem === 'success' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300' : 
            tipoMensagem === 'error' ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300' : 
            'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300' // Info style
          }`}>
            {tipoMensagem === 'success' ? <CheckCircle className="flex-shrink-0 mt-0.5" size={18} /> : 
             tipoMensagem === 'error' ? <AlertCircle className="flex-shrink-0 mt-0.5" size={18} /> :
             <Info className="flex-shrink-0 mt-0.5" size={18} />}
            <span className="flex-grow">{mensagem}</span>
            {isLoading && <Loader2 className="animate-spin ml-2 flex-shrink-0" size={18} />}
          </div>
        )}

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* History Section */}
          {(ultimaExportacao || ultimaImportacao) && (
            <div className="text-xs text-muted-foreground space-y-1 border-b pb-4">
              {ultimaExportacao && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>Última exportação (local/Drive): {formatarData(ultimaExportacao)}</span>
                </div>
              )}
              {ultimaImportacao && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>Última importação (local/Drive): {formatarData(ultimaImportacao)}</span>
                </div>
              )}
            </div>
          )}

          {/* Google Drive Section */}
          <div className="space-y-3 p-4 border rounded-md">
            <h3 className="font-medium">Google Drive</h3>
            {isLoadingAuthCheck ? (
               <div className="flex items-center text-sm text-muted-foreground"> <Loader2 className="animate-spin mr-2" size={16} /> Verificando conexão...</div>
            ) : isDriveAuthenticated ? (
              <div className="space-y-2">
                 <p className="text-sm text-green-600 dark:text-green-400">Conectado ao Google Drive.</p>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                   <Button onClick={handleSaveToDrive} disabled={isLoading} variant="outline" size="sm">
                     <Save size={16} className="mr-1" /> Salvar
                   </Button>
                   <Button onClick={handleLoadFromDrive} disabled={isLoading} variant="outline" size="sm">
                     <FolderOpen size={16} className="mr-1" /> Carregar
                   </Button>
                   <Button onClick={handleDisconnectDrive} disabled={isLoading} variant="destructive" size="sm">
                     <LogOut size={16} className="mr-1" /> Desconectar
                   </Button>
                 </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Conecte sua conta para salvar e carregar backups na nuvem.</p>
                <Button onClick={handleConnectDrive} disabled={isLoading}>
                  <LogIn size={16} className="mr-1" /> Conectar ao Google Drive
                </Button>
              </div>
            )}
          </div>

          {/* Local Backup Section */}
          <div className="space-y-3 pt-4 border-t">
             <h3 className="font-medium">Backup Local</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Local Export */}
                <div className="space-y-1 flex flex-col">
                  <Button onClick={handleExportarLocal} disabled={isLoading} variant="outline">
                    <Download size={18} className="mr-1" /> Exportar Arquivo
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Salva um arquivo .json.</p>
                </div>
                
                {/* Local Import */}
                <div className="space-y-1 flex flex-col">
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading || mostrarConfirmacaoLocal || mostrarConfirmacaoDrive} variant="outline">
                    <Upload size={18} className="mr-1" /> Importar Arquivo
                  </Button>
                  <input type="file" ref={fileInputRef} onChange={handleSelecionarArquivoLocal} accept=".json" className="hidden" />
                  <p className="text-xs text-muted-foreground text-center">Restaura de um arquivo .json.</p>
                </div>
             </div>
          </div>
          
          {/* Local Confirmation Dialog */}
          {mostrarConfirmacaoLocal && arquivoSelecionadoLocal && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md">
              <div className="flex items-start gap-3">
                <Info className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Confirmar Importação Local</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Substituir dados atuais pelos dados do arquivo: <span className="font-mono">{arquivoSelecionadoLocal.name}</span>?
                  </p>
                  <div className="flex gap-2 mt-3">
                    {/* Use outline variant for confirmation */}
                    <Button onClick={confirmarImportacaoLocal} size="sm" variant="outline">Importar Local</Button> 
                    <Button onClick={cancelarImportacaoLocal} size="sm" variant="ghost">Cancelar</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drive Confirmation Dialog */}
          {mostrarConfirmacaoDrive && dadosParaImportarDrive && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md">
              <div className="flex items-start gap-3">
                <Info className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Confirmar Importação do Drive</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Substituir dados atuais pelos dados do backup de <span className="font-mono">{formatarData(timestampImportacaoDrive || null)}</span>?
                  </p>
                  <div className="flex gap-2 mt-3">
                     {/* Use outline variant for confirmation */}
                    <Button onClick={confirmarImportacaoDrive} size="sm" variant="outline">Importar do Drive</Button>
                    <Button onClick={cancelarImportacaoDrive} size="sm" variant="ghost">Cancelar</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for selecting Drive file */}
      <Modal 
        isOpen={showDriveFilesModal} 
        onClose={() => setShowDriveFilesModal(false)}
        title="Selecione um Backup do Google Drive"
      >
        <div className="max-h-96 overflow-y-auto space-y-2 p-1"> {/* Add padding */}
          {isLoadingDriveAction ? (
             <div className="flex justify-center items-center p-4"> <Loader2 className="animate-spin mr-2" size={16} /> Carregando...</div>
          ) : driveFiles.length > 0 ? (
            driveFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => selectDriveFileToLoad(file.id)}
                disabled={isLoading}
                className="w-full text-left p-3 bg-background hover:bg-muted rounded-md transition-colors border disabled:opacity-50"
              >
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  Modificado: {formatarData(file.modifiedTime)}
                </p>
              </button>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhum arquivo de backup encontrado.</p>
          )}
        </div>
      </Modal>
    </>
  );
};
