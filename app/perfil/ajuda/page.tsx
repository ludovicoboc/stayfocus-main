'use client';

import { ArrowLeft, HelpCircle, FileDown, FileUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AjudaImportacaoExportacao() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link 
        href="/perfil" 
        className="flex items-center text-blue-600 dark:text-blue-400 mb-6 hover:underline"
      >
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Perfil
      </Link>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <HelpCircle className="text-blue-600 dark:text-blue-400 mr-2" size={24} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ajuda: Importação e Exportação de Dados
          </h1>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p>
            O StayFocus permite que você faça backup dos seus dados e os restaure quando necessário.
            Isso é útil para transferir seus dados entre dispositivos ou para garantir que você não perca
            suas informações importantes.
          </p>
          
          <h2 className="flex items-center mt-6 mb-3">
            <FileDown className="mr-2 text-green-600 dark:text-green-400" size={20} />
            Exportação de Dados
          </h2>
          
          <p>
            A exportação de dados cria um arquivo JSON contendo todas as suas informações do StayFocus.
            Este arquivo pode ser armazenado com segurança em seu computador ou serviço de armazenamento na nuvem.
          </p>
          
          <h3>Como exportar seus dados:</h3>
          
          <ol className="list-decimal list-inside space-y-2 pl-4">
            <li>Acesse a página de Perfil</li>
            <li>Localize a seção "Importar/Exportar Dados"</li>
            <li>Clique no botão "Exportar Dados"</li>
            <li>Um arquivo chamado <code>stayfocus_backup_DATA.json</code> será baixado automaticamente</li>
            <li>Guarde este arquivo em um local seguro</li>
          </ol>
          
          <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800 my-4">
            <strong>Dica:</strong> Recomendamos fazer backup dos seus dados regularmente, especialmente antes de fazer
            alterações significativas no seu perfil ou configurações.
          </p>
          
          <h2 className="flex items-center mt-6 mb-3">
            <FileUp className="mr-2 text-amber-600 dark:text-amber-400" size={20} />
            Importação de Dados
          </h2>
          
          <p>
            A importação de dados permite restaurar informações previamente exportadas.
            Ao importar dados, todas as informações atuais serão substituídas pelo conteúdo do arquivo de backup.
          </p>
          
          <h3>Como importar seus dados:</h3>
          
          <ol className="list-decimal list-inside space-y-2 pl-4">
            <li>Acesse a página de Perfil</li>
            <li>Localize a seção "Importar/Exportar Dados"</li>
            <li>Clique no botão "Importar Dados"</li>
            <li>Selecione o arquivo de backup previamente exportado</li>
            <li>Confirme a importação quando solicitado</li>
            <li>Aguarde a mensagem de confirmação</li>
          </ol>
          
          <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-100 dark:border-yellow-800 my-4">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Importante:</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                A importação de dados <strong>substituirá</strong> todas as suas informações atuais.
                Este processo não pode ser desfeito, então certifique-se de exportar seus dados atuais
                antes de importar um backup, caso queira preservar as informações atuais.
              </p>
            </div>
          </div>
          
          <h2 className="mt-6 mb-3">Perguntas Frequentes</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">O que acontece com meus dados atuais quando faço uma importação?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Seus dados atuais serão completamente substituídos pelos dados do arquivo importado.
                Recomendamos fazer um backup dos seus dados atuais antes de importar novos dados.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Posso transferir meus dados entre dispositivos diferentes?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sim! Exporte seus dados no dispositivo de origem, transfira o arquivo para o dispositivo
                de destino e então importe os dados nesse novo dispositivo.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">É seguro armazenar o arquivo de backup?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                O arquivo de backup contém todas as suas informações do StayFocus. Recomendamos
                armazená-lo em um local seguro e não compartilhá-lo com terceiros, a menos que
                você esteja ciente de que todas as suas informações pessoais estão contidas nele.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Meu backup é compatível com versões futuras do StayFocus?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fazemos o possível para manter a compatibilidade com versões anteriores, mas
                ocasionalmente alterações estruturais podem ocorrer. Se encontrar problemas ao
                importar um backup antigo, entre em contato com o suporte.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nova Seção: Criando Simulados com IA */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain-circuit text-purple-600 dark:text-purple-400 mr-2"><path d="M12 5a3 3 0 1 0-5.997.004A3 3 0 0 0 12 5Z"/><path d="M12 19a3 3 0 1 0-5.997-.004A3 3 0 0 0 12 19Z"/><path d="M17 12a3 3 0 1 0-.004 5.997A3 3 0 0 0 17 12Z"/><path d="M17 12a3 3 0 1 0-.004-5.997A3 3 0 0 0 17 12Z"/><path d="M12 9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1"/><path d="m14.5 12.5 1-1"/><path d="m15.5 10.5-1 1"/><path d="m14.5 11.5 1 1"/><path d="m15.5 13.5-1-1"/><path d="M9.5 12.5 11 14"/><path d="m6.5 11.5 1 1"/><path d="M8 9.5V7a1 1 0 0 1 1-1h"/><path d="M7.5 12.5 9 11"/></svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Criando Simulados com Inteligência Artificial (IA)
          </h1>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            Você pode usar Modelos de Linguagem Grandes (LLMs), como Claude, ChatGPT, Gemini, entre outros,
            para gerar arquivos de simulado personalizados sobre os conteúdos que você precisa estudar.
            Siga os passos abaixo para garantir que o arquivo gerado seja compatível com o StayFocus.
          </p>

          <h3 className="mt-5 mb-2">1. Copie a Estrutura JSON Necessária</h3>
          <p>
            A IA precisa saber exatamente qual formato de arquivo criar. Copie a estrutura abaixo e forneça-a
            como exemplo no seu prompt (pedido) para a IA:
          </p>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm overflow-x-auto">
            <code>
{`{
  "metadata": {
    "titulo": "Título do Seu Simulado Aqui",
    "concurso": "Opcional: Nome do Concurso",
    "ano": 2025,
    "area": "Opcional: Área de Conhecimento",
    "nivel": "Opcional: Nível (Fácil, Médio, Difícil)",
    "totalQuestoes": 10, // Ajuste o número total de questões
    "autor": "Opcional: Seu Nome ou Fonte"
  },
  "questoes": [
    {
      "id": 1, // ID numérico único para cada questão
      "enunciado": "Texto completo da pergunta aqui...",
      "alternativas": {
        "a": "Texto da alternativa A",
        "b": "Texto da alternativa B",
        "c": "Texto da alternativa C",
        "d": "Texto da alternativa D",
        "e": "Opcional: Texto da alternativa E"
        // Adicione mais alternativas se necessário (f, g, ...)
      },
      "gabarito": "c", // Letra da alternativa correta
      "assunto": "Opcional: Tópico específico da questão",
      "dificuldade": 2, // Opcional: Nível de dificuldade (ex: 1 a 5)
      "explicacao": "Opcional: Justificativa detalhada da resposta correta"
    }
    // Repita a estrutura acima para cada questão, ajustando o "id"
  ]
}`}
            </code>
          </pre>
          <p className="text-sm mt-2">
            <strong>Importante:</strong> Os campos <code>titulo</code>, <code>totalQuestoes</code>, <code>id</code>, <code>enunciado</code>, <code>alternativas</code> e <code>gabarito</code> são <strong>obrigatórios</strong>. Os outros são opcionais.
            Certifique-se de que cada <code>id</code> de questão seja um número único.
          </p>

          <h3 className="mt-5 mb-2">2. Prepare o Conteúdo (Opcional, mas Recomendado)</h3>
          <p>
            Se você tem um texto, PDF ou anotações sobre o conteúdo que deseja transformar em simulado,
            é útil copiá-lo para um arquivo <code>.txt</code> simples. Você poderá anexar este arquivo
            ao seu pedido para a IA, facilitando a criação de questões relevantes.
          </p>

          <h3 className="mt-5 mb-2">3. Crie o Prompt para a IA</h3>
          <p>
            Vá até a interface de chat da sua IA preferida (Claude, ChatGPT, Gemini, etc.) e crie um prompt claro.
            Anexe o arquivo <code>.txt</code> com o conteúdo, se você o criou.
          </p>
          <p><strong>Exemplo de Prompt:</strong></p>
          <blockquote className="border-l-4 border-purple-500 pl-4 italic my-4">
            "Por favor, crie um simulado com [Número] questões de múltipla escolha sobre o conteúdo do arquivo anexado (ou sobre [Tópico Específico]).
            As questões devem abordar [Aspectos específicos do tópico, se houver].
            Gere a resposta estritamente no formato JSON que forneci abaixo. Certifique-se de que cada questão tenha um ID numérico único,
            e que o campo 'totalQuestoes' no metadata corresponda ao número de questões geradas. Inclua 4 alternativas (a, b, c, d) para cada questão.
            Se possível, adicione também os campos opcionais 'assunto' e 'explicacao' para cada questão.

            Aqui está o formato JSON exato a ser seguido:
            [Cole aqui a estrutura JSON copiada no Passo 1]"
          </blockquote>
          <p className="text-sm mt-2">
            Ajuste o `[Número]` de questões e o `[Tópico Específico]` conforme sua necessidade.
          </p>

          <h3 className="mt-5 mb-2">4. Use o JSON Gerado no StayFocus</h3>
          <p>
            A IA deve retornar uma resposta contendo o código JSON. Copie todo esse código JSON.
            Você tem duas opções para carregá-lo no StayFocus:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4 mb-3">
            <li>
              <strong>Opção 1 (Recomendado): Colar o Texto</strong><br/>
              Vá para a seção "Estudos" no StayFocus, clique em "Conferir Simulado". Na tela de carregamento,
              cole o código JSON diretamente na caixa de texto "Opção 2: Colar o texto JSON aqui" e clique no botão
              "Carregar Texto Colado".
            </li>
            <li>
              <strong>Opção 2: Salvar como Arquivo</strong><br/>
              Abra um editor de texto simples (como Bloco de Notas no Windows ou TextEdit no Mac), cole o código JSON
              e salve o arquivo com a extensão <code>.json</code> (ex: <code>meu_simulado.json</code>). Depois, na tela
              "Conferir Simulado" do StayFocus, use a "Opção 1: Carregar arquivo .json" para selecionar este arquivo.
            </li>
          </ul>

          <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-100 dark:border-yellow-800 my-4">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Revisão é Essencial:</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                As IAs podem cometer erros! Sempre revise as questões, alternativas e, principalmente,
                o gabarito gerado pela IA antes de usar o simulado para estudar. Verifique se o JSON está
                corretamente formatado, sem vírgulas extras ou faltando chaves.
              </p>
            </div>
          </div>

        </div>
      </div>
      {/* Fim da Nova Seção */}

    </div>
  );
}
