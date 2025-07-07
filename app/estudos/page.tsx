'use client';
import { useState } from 'react'; // Importar useState
import Link from 'next/link'; // Importar Link para navegação
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button'; // Importar Button
import { Modal } from '@/app/components/ui/Modal'; // Importar Modal
import { TemporizadorPomodoro } from '@/app/components/estudos/TemporizadorPomodoro';
import { RegistroEstudos } from '@/app/components/estudos/RegistroEstudos';
import VisualizadorMarkdown from '@/app/components/estudos/VisualizadorMarkdown'; // Importar VisualizadorMarkdown
import { VisualizadorChecklist } from '@/app/components/estudos/VisualizadorChecklist'; // Importar VisualizadorChecklist
import { useConcursosStore } from '@/app/stores/concursosStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EstudosPage() {
  const { concursos } = useConcursosStore();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [isVisualizationModalOpen, setIsVisualizationModalOpen] = useState(false); // Novo estado para o modal de visualização

  // Novos estados para seleção de arquivos
  const [isFileListModalOpen, setIsFileListModalOpen] = useState(false);
  const [filesForSelection, setFilesForSelection] = useState<{ id: string; name: string }[]>([]);
  const [selectedMaterialType, setSelectedMaterialType] = useState<string | null>(null);

  // Encontrar próximo concurso
  const proximoConcurso = concursos
    .filter(c => c.status !== 'realizado' && new Date(c.dataProva) > new Date())
    .sort((a, b) => new Date(a.dataProva).getTime() - new Date(b.dataProva).getTime())[0];

  // Função para selecionar o tipo de material e buscar arquivos
  const handleSelectMaterialType = async (materialNome: string) => {
    setSelectedMaterialType(materialNome);
    setModalTitle(materialNome); // Define o título do modal de visualização antecipadamente

    try {
      const response = await fetch(`/api/drive/listar-materiais?tipo=${encodeURIComponent(materialNome.toLowerCase())}`);
      const data = await response.json();

      if (response.ok && data.files && Array.isArray(data.files)) {
        if (data.files.length > 1) {
          // Múltiplos arquivos, exibir lista para seleção
          setFilesForSelection(data.files);
          setIsFileListModalOpen(true);
        } else if (data.files.length === 1) {
          // Apenas um arquivo, abrir diretamente
          const file = data.files[0];
          setSelectedFileId(file.id);
          setModalTitle(`${materialNome}: ${file.name}`);
          setIsVisualizationModalOpen(true); // Abre o modal de visualização

        } else {
          // Nenhum arquivo encontrado
          alert(`Nenhum arquivo encontrado para o material: ${materialNome}`);
          setSelectedFileId(null); // Garante que nenhum arquivo anterior seja exibido
        }
      } else {
        // Erro na resposta da API
        alert(`Erro ao listar arquivos para o material: ${materialNome}`);
        console.error('Erro na resposta da API:', data);
        setSelectedFileId(null);
      }
    } catch (error) {
      console.error('Erro ao buscar lista de arquivos:', error);
      alert(`Erro ao buscar lista de arquivos para o material: ${materialNome}`);
      setSelectedFileId(null);
    }
  };

  // Função para lidar com a seleção de um arquivo na lista
  const handleFileSelection = (file: { id: string; name: string }) => {
    if (selectedMaterialType) {
      setSelectedFileId(file.id);
      setModalTitle(`${selectedMaterialType}: ${file.name}`);
      setIsFileListModalOpen(false); // Fecha o modal de seleção de arquivos

      setIsVisualizationModalOpen(true); // Abre o modal de visualização
    }
  };

  // Função para fechar o modal de visualização
  const handleCloseVisualizationModal = () => {
    setIsVisualizationModalOpen(false);
    setSelectedFileId(null);
    setModalTitle('');
    setSelectedMaterialType(null); // Resetar o tipo selecionado ao fechar
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"> {/* Container para título e botão */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estudos</h1>
        <div className="flex gap-2">
          <Link href="/estudos/simulado" passHref>
            <Button variant="outline">Conferir Simulado</Button>
          </Link>
          <Link href="/concursos" passHref>
            <Button variant="default">Ver Todos Concursos</Button>
          </Link>
          <Link href="/estudos/materiais" passHref>
            <Button variant="default">Acesso a matérias de estudos</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temporizador Pomodoro Adaptado */}
        <Card title="Temporizador Pomodoro">
          <TemporizadorPomodoro />
        </Card>

        {/* Registro de Sessões de Estudo */}
        <Card title="Registro de Estudos">
          <RegistroEstudos />
        </Card>

        {/* Próximo Concurso */}
        <Card title="Próximo Concurso">
          {proximoConcurso ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{proximoConcurso.titulo}</h3>
                <p className="text-sm text-gray-500">{proximoConcurso.organizadora}</p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Data da Prova:</span>
                <span>{format(new Date(proximoConcurso.dataProva), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>Progresso de estudos</span>
                  <span className="font-medium">
                    {Math.round(
                      (proximoConcurso.conteudoProgramatico?.reduce((acc, curr) => acc + curr.progresso, 0) || 0) /
                      (proximoConcurso.conteudoProgramatico?.length || 1)
                    )}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${Math.round(
                        (proximoConcurso.conteudoProgramatico?.reduce((acc, curr) => acc + curr.progresso, 0) || 0) /
                        (proximoConcurso.conteudoProgramatico?.length || 1)
                      )}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href={`/concursos/${proximoConcurso.id}`} passHref>
                  <Button variant="link" className="text-indigo-600">
                    Ver detalhes
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhum concurso planejado</p>
              <Link href="/concursos" passHref>
                <Button variant="outline">Adicionar Concurso</Button>
              </Link>
            </div>
          )}
        </Card>
        {/* Materiais de Estudo */}
        <Card title="Materiais de Estudo" className="md:col-span-2"> {/* Ocupa a largura total em telas médias */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4"> {/* Adicionado padding */}
            <Button variant="outline" onClick={() => handleSelectMaterialType('Resumos')}>Resumos</Button>
            <Button variant="outline" onClick={() => handleSelectMaterialType('Flashcards')}>Flashcards</Button>
            <Button variant="outline" onClick={() => handleSelectMaterialType('Simulados')}>Simulados</Button>
            <Button variant="outline" onClick={() => handleSelectMaterialType('Tarefas')}>Tarefas</Button>
            <Button variant="outline" onClick={() => handleSelectMaterialType('Estratégias de Foco')}>Estratégias de Foco</Button>
            <Button variant="outline" onClick={() => handleSelectMaterialType('Agendamento de Pausas')}>Agendamento de Pausas</Button>
            <Button variant="outline" onClick={() => handleSelectMaterialType('Mapas Mentais')}>Mapas Mentais</Button>
            <Button variant="outline" onClick={() => handleSelectMaterialType('Outlines de Infográficos')}>Outlines de Infográficos</Button>
            <Button variant="outline" onClick={() => handleSelectMaterialType('Checklists')}>Checklists</Button>
            <Button variant="outline" onClick={() => handleSelectMaterialType('Guias de Estudo')}>Guias de Estudo</Button>
          </div>
        </Card>
      </div>

      {/* Modal para seleção de arquivos */}
      <Modal
        isOpen={isFileListModalOpen}
        onClose={() => setIsFileListModalOpen(false)}
        title={`Selecionar Arquivo para ${selectedMaterialType}`}
      >
        <div className="space-y-2">
          {filesForSelection.map((file) => (
            <Button
              key={file.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleFileSelection(file)}
            >
              {file.name}
            </Button>
          ))}
        </div>
      </Modal>

      {/* Renderiza o Modal VisualizadorMarkdown */}
      {selectedMaterialType !== 'Checklists' && (
        <VisualizadorMarkdown
          isOpen={isVisualizationModalOpen}
          onClose={handleCloseVisualizationModal}
          fileId={selectedFileId}
          title={modalTitle}
        />
      )}

      {/* Renderiza o Modal VisualizadorChecklist */}
      {selectedMaterialType === 'Checklists' && (
        <VisualizadorChecklist
          isOpen={isVisualizationModalOpen}
          onClose={handleCloseVisualizationModal}
          fileId={selectedFileId}
          title={modalTitle}
        />
      )}
    </div>
  )
}
