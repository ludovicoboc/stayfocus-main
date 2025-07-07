'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Modal } from '@/app/components/ui/Modal';
import VisualizadorMarkdown from '@/app/components/estudos/VisualizadorMarkdown';
import { VisualizadorChecklist } from '@/app/components/estudos/VisualizadorChecklist';
import { Input } from '@/app/components/ui/Input';

const materialTypes = [
  'Resumos',
  'Flashcards',
  'Simulados',
  'Tarefas',
  'Estratégias de Foco',
  'Agendamento de Pausas',
  'Mapas Mentais',
  'Outlines de Infográficos',
  'Checklists',
  'Guias de Estudo',
];

export default function MateriaisPage() {
  const [isFileListModalOpen, setIsFileListModalOpen] = useState(false);
  const [filesForSelection, setFilesForSelection] = useState<{ id: string; name: string }[]>([]);
  const [selectedMaterialType, setSelectedMaterialType] = useState<string | null>(null);
  const [isVisualizationModalOpen, setIsVisualizationModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const handleSelectMaterialType = async (type: string) => {
    setSelectedMaterialType(type);
    setModalTitle(type); // Use type as initial modal title

    const subfolderId = prompt(`Por favor, insira o ID da pasta "${type}" no Google Drive:`);
    if (!subfolderId) {
      alert('ID da pasta não fornecido.');
      return;
    }

    try {
      const response = await fetch(`/api/drive/listar-materiais?folderId=${encodeURIComponent(subfolderId)}`);
      const data = await response.json();

      if (response.ok) {
        const filteredFiles = data.files.filter((file: { id: string; name: string }) =>
          file.name.toLowerCase().includes(type.toLowerCase())
        );

        if (filteredFiles && filteredFiles.length > 1) {
          // Assuming data.files is an array of { id: string, name: string }
          setFilesForSelection(filteredFiles);
          setIsFileListModalOpen(true);
        } else if (filteredFiles && filteredFiles.length === 1) {
          // Directly open visualization if only one file
          const file = filteredFiles[0];
          setSelectedFileId(file.id);
          setModalTitle(`${type}: ${file.name}`);
          setIsVisualizationModalOpen(true);
          setIsFileListModalOpen(false); // Close file list modal if it was open
        } else {
          // No files found
          alert(`Nenhum material encontrado para ${type}.`);
          setFilesForSelection([]);
          setSelectedFileId(null);
          setIsFileListModalOpen(false);
          setIsVisualizationModalOpen(false);
        }
      } else {
        // Handle API errors
        alert(`Erro ao listar materiais: ${data.error}`);
        setFilesForSelection([]);
        setSelectedFileId(null);
        setIsFileListModalOpen(false);
        setIsVisualizationModalOpen(false);
      }
    } catch (error) {
      console.error('Erro ao buscar lista de materiais:', error);
      alert('Erro ao buscar lista de materiais.');
      setFilesForSelection([]);
      setSelectedFileId(null);
      setIsFileListModalOpen(false);
      setIsVisualizationModalOpen(false);
    }
  };

  const handleFileSelection = (file: { id: string; name: string }) => {
    if (selectedMaterialType) {
      setSelectedFileId(file.id);
      setModalTitle(`${selectedMaterialType}: ${file.name}`);
      setIsFileListModalOpen(false);
      setIsVisualizationModalOpen(true);
    }
  };

  const handleCloseVisualizationModal = () => {
    setIsVisualizationModalOpen(false);
    setSelectedFileId(null);
    setSelectedMaterialType(null);
    setModalTitle('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Materiais de Estudo</h1>

      <Card title="Tipos de Materiais">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materialTypes.map((type) => (
            <Button key={type} onClick={() => handleSelectMaterialType(type)}>
              {type}
            </Button>
          ))}
        </div>
      </Card>

      {/* Modal para seleção de arquivos */}
      <Modal
        isOpen={isFileListModalOpen}
        onClose={() => setIsFileListModalOpen(false)}
        title={`Selecionar Arquivo de ${selectedMaterialType}`}
      >
        <div className="flex flex-col gap-2">
          {filesForSelection.map((file) => (
            <Button key={file.id} onClick={() => handleFileSelection(file)}>
              {file.name}
            </Button>
          ))}
        </div>
      </Modal>

      {/* Modal para visualização do material */}
      <Modal
        isOpen={isVisualizationModalOpen}
        onClose={handleCloseVisualizationModal}
        title={modalTitle}
        size="xl" // Adjust size as needed
      >
        {selectedFileId && selectedMaterialType && (
          selectedMaterialType === 'Checklists' ? (
            <VisualizadorChecklist isOpen={isVisualizationModalOpen} fileId={selectedFileId} title={modalTitle} onClose={handleCloseVisualizationModal} />
          ) : (
            <VisualizadorMarkdown isOpen={isVisualizationModalOpen} fileId={selectedFileId} title={modalTitle} onClose={handleCloseVisualizationModal} />
          )
        )}
      </Modal>
    </div>
  );
}