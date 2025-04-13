'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea';
import { Alert } from '@/app/components/ui/Alert';
import { Card } from '@/app/components/ui/Card';
import { Download, UploadCloud, Wand2, Loader2 } from 'lucide-react';
import { useConcursosStore, Concurso } from '@/app/stores/concursosStore';

// Interface para o JSON esperado (simplificada, pode ser mais detalhada)
interface ConcursoJson {
  titulo: string;
  organizadora: string;
  dataInscricao: string; // Formato YYYY-MM-DD
  dataProva: string; // Formato YYYY-MM-DD
  edital?: string;
  status?: 'planejado' | 'inscrito' | 'estudando' | 'realizado' | 'aguardando_resultado';
  conteudoProgramatico?: { disciplina: string; topicos: string[] }[];
}

export function GeradorContextoLLM() {
  const { adicionarConcurso } = useConcursosStore();
  const [nomeConcurso, setNomeConcurso] = useState('');
  const [urlEdital, setUrlEdital] = useState('');
  const [generatedJson, setGeneratedJson] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGerarContexto = async () => {
    if (!nomeConcurso.trim() && !urlEdital.trim()) {
      setError('Por favor, informe o nome do concurso ou a URL do edital.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setGeneratedJson(''); // Limpa JSON anterior

    try {
      // --- Lógica de chamada da API LLM (Etapa 2) ---
      // const response = await fetch('/api/gerar-contexto-concurso', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ nome: nomeConcurso, url: urlEdital }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Falha ao gerar contexto.');
      // }
      // const data: ConcursoJson = await response.json();
      // setGeneratedJson(JSON.stringify(data, null, 2)); // Formata o JSON para exibição

      // --- Placeholder enquanto a API não existe ---
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay da API
      const mockData: ConcursoJson = {
        titulo: nomeConcurso || "Concurso Gerado (Mock)",
        organizadora: "Banca Exemplo",
        dataInscricao: "2025-06-01",
        dataProva: "2025-08-15",
        edital: urlEdital || undefined,
        status: "planejado",
        conteudoProgramatico: [
          { disciplina: "Português", topicos: ["Interpretação", "Gramática"] },
          { disciplina: "Matemática", topicos: ["Lógica", "Conjuntos"] }
        ]
      };
      setGeneratedJson(JSON.stringify(mockData, null, 2));
      setSuccessMessage('Contexto do concurso gerado (dados simulados).');
      // --- Fim do Placeholder ---

    } catch (err) {
      console.error("Erro ao gerar contexto:", err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportarJson = () => {
    setError(null);
    setSuccessMessage(null);
    if (!generatedJson) {
      setError('Nenhum JSON gerado para importar.');
      return;
    }
    try {
      const concursoData: ConcursoJson = JSON.parse(generatedJson);

      // Validação básica (pode ser mais robusta)
      if (!concursoData.titulo || !concursoData.organizadora || !concursoData.dataInscricao || !concursoData.dataProva) {
        throw new Error('JSON inválido ou faltando campos obrigatórios (título, organizadora, dataInscricao, dataProva).');
      }

      // Adaptação para o formato esperado por adicionarConcurso (Omit<Concurso, 'id'>)
      const dadosParaStore: Omit<Concurso, 'id'> = {
        titulo: concursoData.titulo,
        organizadora: concursoData.organizadora,
        dataInscricao: concursoData.dataInscricao,
        dataProva: concursoData.dataProva,
        edital: concursoData.edital,
        status: concursoData.status || 'planejado',
        // Garante que conteudoProgramatico seja um array e tenha a estrutura correta
        conteudoProgramatico: (concursoData.conteudoProgramatico || []).map(cp => ({
          disciplina: cp.disciplina || 'Não especificada',
          topicos: cp.topicos || [],
          progresso: 0 // Adiciona progresso inicial
        })),
      };

      adicionarConcurso(dadosParaStore);
      setSuccessMessage(`Concurso "${concursoData.titulo}" importado com sucesso!`);
      setGeneratedJson(''); // Limpa após importar
      setNomeConcurso('');
      setUrlEdital('');

    } catch (err) {
      console.error("Erro ao importar JSON:", err);
      setError(err instanceof Error ? err.message : 'Erro ao processar ou importar o JSON.');
    }
  };

  const handleBaixarJson = () => {
    if (!generatedJson) return;
    try {
      const data = JSON.parse(generatedJson);
      const blob = new Blob([generatedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = data.titulo ? `${data.titulo.replace(/\s+/g, '_')}.json` : 'concurso.json';
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
       console.error("Erro ao baixar JSON:", err);
       setError('Erro ao formatar JSON para download.');
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-4">Gerar Contexto do Concurso (via LLM - Simulado)</h3>
      <div className="space-y-4">
        <Input
          label="Nome do Concurso (Opcional se URL for fornecida)"
          value={nomeConcurso}
          onChange={(e) => setNomeConcurso(e.target.value)}
          placeholder="Ex: Analista Judiciário - TRF"
          disabled={isLoading}
        />
        <Input
          label="URL do Edital (Opcional se Nome for fornecido)"
          value={urlEdital}
          onChange={(e) => setUrlEdital(e.target.value)}
          placeholder="https://..."
          disabled={isLoading}
        />
        <Button
          onClick={handleGerarContexto}
          disabled={isLoading || (!nomeConcurso.trim() && !urlEdital.trim())}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Gerar Contexto
        </Button>

        {error && <Alert variant="error">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        {generatedJson && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">JSON Gerado:</h4>
            <Textarea
              value={generatedJson}
              readOnly
              rows={10}
              className="font-mono text-xs bg-gray-50 dark:bg-gray-800"
            />
            <div className="flex gap-2">
              <Button onClick={handleImportarJson} variant="default" className="flex-1">
                <UploadCloud className="h-4 w-4 mr-2" />
                Importar para o Sistema
              </Button>
              <Button onClick={handleBaixarJson} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar JSON
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
