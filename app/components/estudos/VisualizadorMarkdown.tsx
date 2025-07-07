import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import ReactMarkdown from 'react-markdown';

interface VisualizadorMarkdownProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string | null;
  title?: string;
}

const VisualizadorMarkdown: React.FC<VisualizadorMarkdownProps> = ({
  isOpen,
  onClose,
  fileId,
  title = "Material de Estudo",
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !fileId) {
      // Reset state when modal is closed or no file ID is provided
      setContent('');
      setLoading(false);
      setError(null);
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/drive/carregar-material?fileId=${encodeURIComponent(fileId)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.content) {
          setContent(data.content);
        } else {
          throw new Error(data.error || "Conteúdo não encontrado na resposta da API do Google Drive.");
        }
      } catch (err) {
        console.error("Erro ao buscar conteúdo Markdown do Google Drive:", err);
        setError("Erro ao carregar o material do Google Drive. Verifique o console para mais detalhes.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

  }, [fileId, isOpen]); // Depend on fileId and isOpen

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mt-4 max-h-[70vh] overflow-y-auto p-1">
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && content && (
          <article className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        )}
         {!loading && !error && !content && fileId && <p>Nenhum conteúdo para exibir.</p>}
         {!fileId && <p>Selecione um material para visualizar.</p>}
      </div>
    </Modal>
  );
};

export default VisualizadorMarkdown;