import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface ImportarConcursoJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (concurso: any) => void;
}

const TEMPLATE = `{
  "titulo": "",
  "organizadora": "",
  "dataInscricao": "",
  "dataProva": "",
  "linkEdital": "",
  "conteudoProgramatico": [
    {
      "disciplina": "",
      "topicos": ["", ""]
    }
  ]
}`;

function validarConcursoJson(json: any): string | null {
  if (typeof json !== "object" || !json) return "JSON inválido.";
  if (!json.titulo || !json.organizadora || !json.dataInscricao || !json.dataProva) return "Campos obrigatórios ausentes.";
  if (!Array.isArray(json.conteudoProgramatico) || json.conteudoProgramatico.length === 0) return "Conteúdo programático ausente.";
  for (const d of json.conteudoProgramatico) {
    if (!d.disciplina || !Array.isArray(d.topicos)) return "Disciplina ou tópicos inválidos.";
  }
  return null;
}

export function ImportarConcursoJsonModal({ isOpen, onClose, onImport }: ImportarConcursoJsonModalProps) {
  const [jsonText, setJsonText] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  function parseDateBRtoISO(dateStr: string): string | null {
    // Aceita "dd/MM/yyyy" ou "dd/MM/yyyy a dd/MM/yyyy"
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return null;
    const [_, d, m, y] = match;
    return `${y}-${m}-${d}`;
  }

  const handleImport = () => {
    setErro(null);
    setSucesso(null);
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setErro("JSON mal formatado.");
      return;
    }
    const valid = validarConcursoJson(parsed);
    if (valid) {
      setErro(valid);
      return;
    }
    // Corrigir datas para formato ISO
    const dataProvaISO = parseDateBRtoISO(parsed.dataProva);
    if (!dataProvaISO) {
      setErro("Data da prova inválida. Use formato dd/MM/yyyy.");
      return;
    }
    let dataInscricaoISO = parseDateBRtoISO(parsed.dataInscricao);
    if (!dataInscricaoISO) {
      // Tentar extrair data inicial de intervalo
      const partes = parsed.dataInscricao.split(" a ");
      dataInscricaoISO = parseDateBRtoISO(partes[0]);
      if (!dataInscricaoISO) {
        setErro("Data de inscrição inválida. Use formato dd/MM/yyyy ou intervalo.");
        return;
      }
    }
    const concursoCorrigido = {
      ...parsed,
      dataProva: dataProvaISO,
      dataInscricao: dataInscricaoISO,
    };
    setSucesso("Concurso importado com sucesso!");
    onImport(concursoCorrigido);
    setTimeout(() => {
      setSucesso(null);
      onClose();
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar JSON do Edital">
      <div className="space-y-3">
        <p>Cole abaixo o JSON extraído da LLM externa (Claude, ChatGPT, etc.).</p>
        <textarea
          className="w-full border rounded p-2 font-mono text-sm"
          rows={10}
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          placeholder={TEMPLATE}
        />
        <div>
          <Button onClick={handleImport}>Importar</Button>
          <Button variant="outline" onClick={onClose} className="ml-2">Cancelar</Button>
        </div>
        {erro && <div className="text-red-600 text-sm">{erro}</div>}
        {sucesso && <div className="text-green-600 text-sm">{sucesso}</div>}
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-gray-500">Ver template de exemplo</summary>
          <pre className="bg-gray-100 p-2 rounded text-xs">{TEMPLATE}</pre>
        </details>
      </div>
    </Modal>
  );
}