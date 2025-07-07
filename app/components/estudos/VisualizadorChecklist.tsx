'use client';

import { Fragment, ReactNode, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { Button } from '@/app/components/ui/Button';
import { Modal } from '@/app/components/ui/Modal'; // Import the Modal component

interface ChecklistItem {
  id: number;
  text: string;
  checked: boolean;
  level: number; // To handle indentation for sub-items
}

interface VisualizadorChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string | null;
  title?: string; // Optional title
}

export function VisualizadorChecklist({
  isOpen,
  onClose,
  fileId,
  title = 'Checklist', // Default title
}: VisualizadorChecklistProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (!isOpen || !fileId) {
      setContent('');
      setChecklistItems([]);
      setError(null);
      return;
    }

    const fetchChecklist = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/drive/carregar-material?fileId=${encodeURIComponent(fileId)}`);
        if (!response.ok) {
          throw new Error(`Erro ao carregar o checklist do Google Drive: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.success) {
           throw new Error(data.error || 'Erro desconhecido ao carregar o checklist do Google Drive');
        }
        setContent(data.content);
        parseChecklist(data.content);
      } catch (err: any) {
        setError(err.message);
        setContent('');
        setChecklistItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [isOpen, fileId]);

  const parseChecklist = (markdownContent: string) => {
    const lines = markdownContent.split('\n');
    const items: ChecklistItem[] = [];
    let itemId = 0;

    lines.forEach(line => {
      const trimmedLine = line.trimStart();
      const level = line.length - trimmedLine.length; // Simple indentation level based on leading spaces

      const checkboxMatch = trimmedLine.match(/^- \[( |x)\] (.*)$/);
      if (checkboxMatch) {
        const checked = checkboxMatch[1] === 'x';
        const text = checkboxMatch[2].trim();
        items.push({ id: itemId++, text, checked, level });
      } else if (trimmedLine.startsWith('- ')) {
        // Handle list items that are not checkboxes, maybe just text
        const text = trimmedLine.substring(2).trim();
         items.push({ id: itemId++, text, checked: false, level, isText: true } as any); // Add a flag for non-checkbox items
      } else {
         // Handle other lines, maybe just text
         if (trimmedLine) {
            items.push({ id: itemId++, text: trimmedLine, checked: false, level, isText: true } as any);
         }
      }
    });

    setChecklistItems(items);
  };

  const handleCheckChange = (id: number) => {
    setChecklistItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {loading && <p>Carregando checklist...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}
      {!loading && !error && checklistItems.length > 0 && (
        <div className="prose dark:prose-invert max-w-none">
          <ul>
            {checklistItems.map(item => (
              <li key={item.id} style={{ marginLeft: `${item.level * 16}px` }}>
                {'isText' in item && (item as any).isText ? (
                   // Render as text if not a checkbox item
                   <span>{item.text}</span>
                ) : (
                   // Render as checkbox item
                   <label className="flex items-center space-x-2">
                     <input
                       type="checkbox"
                       checked={item.checked}
                       onChange={() => handleCheckChange(item.id)}
                       className="form-checkbox h-4 w-4 text-blue-600"
                     />
                     <span>{item.text}</span>
                   </label>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
       {!loading && !error && checklistItems.length === 0 && content && (
           <p>Nenhum item de checklist encontrado neste arquivo.</p>
       )}
        {!loading && !error && !content && !fileId && (
            <p>Selecione um arquivo de checklist para visualizar.</p>
        )}
    </Modal>
  );
}