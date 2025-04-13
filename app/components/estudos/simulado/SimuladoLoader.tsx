'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react'; // Adicionar useEffect
import { useSimuladoStore, SimuladoData } from '@/app/stores/simuladoStore';
import { useConcursosStore } from '@/app/stores/concursosStore'; // Importar store de concursos
import { useQuestoesStore } from '@/app/stores/questoesStore'; // Importar store de questões
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea';
import { Alert } from '@/app/components/ui/Alert';
import { Select } from '@/app/components/ui/Select'; // Importar Select
import { Upload, ClipboardPaste, PlayCircle } from 'lucide-react'; // Importar ícones

const SimuladoLoader: React.FC = () => {
  const { loadSimulado, setStatus } = useSimuladoStore();
  const { concursos } = useConcursosStore(); // Obter lista de concursos
  const { buscarQuestoesPorConcurso } = useQuestoesStore(); // Obter função de busca
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para geração de simulado
  const [selectedConcursoId, setSelectedConcursoId] = useState<string>('');
  const [numQuestoes, setNumQuestoes] = useState<number>(10); // Default 10 questões
  const [concursoOptions, setConcursoOptions] = useState<{ value: string; label: string }[]>([]);

  // Popula as opções do select de concursos quando a lista de concursos mudar
  useEffect(() => {
    const options = concursos.map(c => ({ value: c.id, label: c.titulo }));
    setConcursoOptions(options);
    // Se havia um concurso selecionado que não existe mais, limpa a seleção
    if (selectedConcursoId && !options.some(opt => opt.value === selectedConcursoId)) {
      setSelectedConcursoId('');
    }
  }, [concursos, selectedConcursoId]);

  // Função genérica para processar os dados JSON (seja de arquivo ou texto)
  const processJsonData = (jsonData: string) => {
    try {
      const data: SimuladoData = JSON.parse(jsonData);

      // Validação básica da estrutura do JSON (pode ser mais robusta)
      if (!data.metadata || !data.questoes || !Array.isArray(data.questoes)) {
        throw new Error('Estrutura do JSON inválida. Verifique o formato do arquivo/texto.');
      }
      if (data.questoes.length === 0) {
        throw new Error('O JSON não contém questões.');
      }
      // Validação mais profunda das questões pode ser adicionada aqui

      loadSimulado(data); // Carrega os dados no store (que mudará o status para 'reviewing')
    } catch (err) {
      console.error('Erro ao processar o JSON:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao processar o JSON.');
      setStatus('idle'); // Volta para o estado inicial em caso de erro
      setIsLoading(false); // Garante que o loading pare em caso de erro
    }
    // O finally que estava aqui foi movido para os handlers específicos
  };


  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        setError('Nenhum arquivo selecionado.');
        return;
      }

      if (file.type !== 'application/json') {
        setError('Formato de arquivo inválido. Por favor, selecione um arquivo .json.');
        return;
      }

      setError(null);
      setIsLoading(true);
      setStatus('loading');

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          processJsonData(text); // Chama a função genérica
        } else {
          setError('Falha ao ler o conteúdo do arquivo.');
          setStatus('idle');
        }
        // O setIsLoading(false) agora é chamado dentro de processJsonData em caso de sucesso/erro
      };
      reader.onerror = () => {
        // O setIsLoading(false) é chamado aqui também
        setError('Erro ao ler o arquivo.');
        setIsLoading(false); // Adicionado aqui
        setStatus('idle');
      };
      reader.readAsText(file);
    },
    [loadSimulado, setStatus, processJsonData] // Adicionar processJsonData às dependências
  );

  // Handler para carregar do texto da textarea
  const handleLoadFromText = () => {
    if (!jsonText.trim()) {
      setError('A caixa de texto está vazia.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setStatus('loading');
    // Adiciona um pequeno delay para o feedback visual do loading ser percebido
    setTimeout(() => {
        processJsonData(jsonText);
        // O setIsLoading(false) é chamado dentro de processJsonData
    }, 100);
  };

  // Handler para gerar simulado a partir dos critérios selecionados
  const handleGenerateSimulado = () => {
    if (!selectedConcursoId) {
      setError('Por favor, selecione um concurso.');
      return;
    }
    if (numQuestoes <= 0) {
      setError('O número de questões deve ser maior que zero.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setStatus('loading');

    try {
      const questoesDisponiveis = buscarQuestoesPorConcurso(selectedConcursoId);

      if (questoesDisponiveis.length === 0) {
        throw new Error('Nenhuma questão encontrada para este concurso.');
      }

      // Embaralhar e selecionar o número desejado de questões
      const questoesSelecionadas = [...questoesDisponiveis]
        .sort(() => 0.5 - Math.random()) // Embaralha
        .slice(0, numQuestoes); // Pega o número desejado

      const concursoSelecionado = concursos.find(c => c.id === selectedConcursoId);

      // Monta a estrutura SimuladoData
      const simuladoData: SimuladoData = {
        metadata: {
          titulo: `Simulado - ${concursoSelecionado?.titulo || 'Concurso Selecionado'}`,
          // descricao: `Simulado gerado com ${questoesSelecionadas.length} questões.`, // Remover campo inexistente
          totalQuestoes: questoesSelecionadas.length, // Adicionar totalQuestoes que é obrigatório
          dataGeracao: new Date().toISOString(),
          // origem: 'gerado_app', // Remover campo inexistente
          // Adicionar outros campos opcionais de metadata se disponíveis/relevantes
          concurso: concursoSelecionado?.titulo,
          // filtros: { // Remover campo inexistente
          //   concursoId: selectedConcursoId,
          //   numQuestoesSolicitadas: numQuestoes,
          //   numQuestoesGeradas: questoesSelecionadas.length,
          // }
        },
        // Mapeia as questões do questoesStore para o formato do simuladoStore
        questoes: questoesSelecionadas.map((q, index) => {
          const alternativasObj: { [key: string]: string } = {};
          let gabaritoKey = '';
          // Converte array de alternativas para objeto e encontra a chave do gabarito (a, b, c...)
          q.alternativas.forEach((alt, altIndex) => {
            const key = String.fromCharCode(97 + altIndex); // a, b, c...
            alternativasObj[key] = alt.texto;
            if (alt.id === q.respostaCorreta) {
              gabaritoKey = key;
            }
          });

          return {
            id: index + 1, // Usa o índice + 1 como ID numérico (pode ser frágil)
            enunciado: q.enunciado,
            alternativas: alternativasObj,
            gabarito: gabaritoKey,
            assunto: q.topico || q.disciplina, // Usa tópico ou disciplina como assunto
            dificuldade: q.nivelDificuldade ? (['facil', 'medio', 'dificil'].indexOf(q.nivelDificuldade) + 1) : undefined, // Mapeia dificuldade se existir
            explicacao: q.justificativa, // Usa justificativa como explicação
            // respondida, respostaUsuario, acertou não são parte da definição base da Questao no store
          };
        }),
      };

      loadSimulado(simuladoData); // Carrega o simulado gerado

    } catch (err) {
      console.error('Erro ao gerar simulado:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao gerar simulado.');
      setStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground space-y-6">
      <h2 className="text-xl font-semibold text-center">Iniciar Simulado</h2>

      {/* Mensagem de erro global */}
      {error && (
        <Alert variant="error" className="w-full mb-4">
          {error}
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="w-full">
          {error}
        </Alert>
      )}

      {/* Opção 1: Gerar Simulado */}
      <div className="border p-4 rounded-md">
        <h3 className="text-lg font-medium mb-3">Gerar Simulado</h3>
        <div className="space-y-3">
          <Select
            label="Selecione o Concurso"
            value={selectedConcursoId}
            onChange={(e) => setSelectedConcursoId(e.target.value)}
            options={[{ value: '', label: 'Selecione...' }, ...concursoOptions]}
            disabled={isLoading || concursoOptions.length === 0}
          />
          <Input
            label="Número de Questões"
            type="number"
            value={numQuestoes}
            onChange={(e) => setNumQuestoes(Math.max(1, parseInt(e.target.value, 10) || 1))} // Garante > 0
            min="1"
            disabled={isLoading}
          />
          <Button
            onClick={handleGenerateSimulado}
            disabled={isLoading || !selectedConcursoId || numQuestoes <= 0}
            className="w-full justify-center"
          >
            {isLoading ? (
              <><PlayCircle size={16} className="mr-2 animate-pulse" /> Gerando...</>
            ) : (
              <><PlayCircle size={16} className="mr-2" /> Gerar e Iniciar Simulado</>
            )}
          </Button>
        </div>
         {concursoOptions.length === 0 && !isLoading && (
           <p className="text-xs text-muted-foreground mt-2 text-center">Nenhum concurso cadastrado ainda. Adicione um concurso para gerar simulados.</p>
         )}
      </div>


      {/* Divisor */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-2 text-sm text-muted-foreground">OU</span>
        </div>
      </div>

      {/* Opção 2: Carregar Arquivo */}
      <div className="border p-4 rounded-md">
         <h3 className="text-lg font-medium mb-3">Carregar de Arquivo .json</h3>
         <Button
             onClick={() => fileInputRef.current?.click()}
             disabled={isLoading}
             variant="outline"
             className="flex-grow justify-center"
           >
             <Upload size={16} className="mr-2" /> Selecionar Arquivo
           </Button>
           <Input
             id="file-upload"
             ref={fileInputRef}
             type="file"
             accept=".json"
             onChange={handleFileChange}
             disabled={isLoading}
             className="hidden" // Esconde o input padrão
           />
        {/* </div> removido - estava sobrando aqui */}
      </div>


      {/* Divisor */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-2 text-sm text-muted-foreground">OU</span>
        </div>
      </div>

      {/* Opção 3: Colar Texto */}
      <div className="border p-4 rounded-md">
         <h3 className="text-lg font-medium mb-3">Colar Texto JSON</h3>
         <Textarea
          id="json-text"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Cole o conteúdo JSON gerado pela IA aqui..."
          rows={8}
          className="mb-2"
          disabled={isLoading}
        />
        <Button
          onClick={handleLoadFromText}
          disabled={isLoading || !jsonText.trim()}
          className="w-full justify-center"
        >
          {isLoading ? (
             <><Upload size={16} className="mr-2 animate-pulse" /> Carregando...</>
          ) : (
             <><ClipboardPaste size={16} className="mr-2" /> Carregar Texto Colado</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SimuladoLoader;
