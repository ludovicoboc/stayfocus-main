import Database from 'better-sqlite3';
import path from 'path';

// Determina o caminho para o arquivo do banco de dados na raiz do projeto
const dbPath = path.resolve(process.cwd(), 'database.db');
const db = new Database(dbPath, { verbose: console.log });

function init() {
  console.log('Iniciando a criação do schema do banco de dados...');

  // Tabela de Usuários (simplificada)
  // Armazena informações básicas do usuário vindas do Google
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      googleId TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabela de Configurações do Perfil
  // Ligada a um usuário
  db.exec(`
    CREATE TABLE IF NOT EXISTS perfil_settings (
      userId INTEGER PRIMARY KEY,
      altoContraste BOOLEAN DEFAULT FALSE,
      reducaoEstimulos BOOLEAN DEFAULT FALSE,
      textoGrande BOOLEAN DEFAULT FALSE,
      horasSono REAL DEFAULT 8,
      tarefasPrioritarias INTEGER DEFAULT 3,
      coposAgua INTEGER DEFAULT 8,
      pausasProgramadas INTEGER DEFAULT 4,
      notificacoesAtivas BOOLEAN DEFAULT TRUE,
      pausasAtivas BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Blocos de Tempo (Painel do Dia)
  db.exec(`
    CREATE TABLE IF NOT EXISTS blocos_tempo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      hora TEXT NOT NULL,
      atividade TEXT NOT NULL,
      categoria TEXT CHECK(categoria IN ('inicio', 'alimentacao', 'estudos', 'saude', 'lazer', 'nenhuma')),
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Prioridades
  db.exec(`
    CREATE TABLE IF NOT EXISTS prioridades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      texto TEXT NOT NULL,
      concluida BOOLEAN DEFAULT FALSE,
      data TEXT NOT NULL, -- Formato YYYY-MM-DD
      tipo TEXT DEFAULT 'geral',
      origemId TEXT,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Planejamento de Refeições
  db.exec(`
    CREATE TABLE IF NOT EXISTS refeicoes_planejadas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      horario TEXT NOT NULL,
      descricao TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Registro de Refeições
  db.exec(`
    CREATE TABLE IF NOT EXISTS refeicoes_registradas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      data TEXT NOT NULL,
      horario TEXT NOT NULL,
      descricao TEXT NOT NULL,
      tipoIcone TEXT,
      foto TEXT, -- Caminho para a foto ou URL
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Hidratação
  db.exec(`
    CREATE TABLE IF NOT EXISTS hidratacao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      data TEXT NOT NULL, -- YYYY-MM-DD
      coposBebidos INTEGER DEFAULT 0,
      metaDiaria INTEGER DEFAULT 8,
      UNIQUE(userId, data),
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Sessões de Estudo
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessoes_estudo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT,
      duracao INTEGER NOT NULL, -- em minutos
      data TEXT NOT NULL, -- YYYY-MM-DD
      completo BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Medicamentos (Módulo Saúde)
  db.exec(`
    CREATE TABLE IF NOT EXISTS medicamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      nome TEXT NOT NULL,
      dosagem TEXT,
      frequencia TEXT,
      horarios TEXT, -- Armazenado como JSON array de strings
      observacoes TEXT,
      dataInicio TEXT,
      ultimaTomada TEXT,
      intervalo INTEGER,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Registros de Humor (Módulo Saúde)
  db.exec(`
    CREATE TABLE IF NOT EXISTS registros_humor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      data TEXT NOT NULL,
      nivel INTEGER NOT NULL,
      fatores TEXT, -- Armazenado como JSON array de strings
      notas TEXT,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // --- Módulo Finanças ---

  // Tabela de Categorias Financeiras
  db.exec(`
    CREATE TABLE IF NOT EXISTS categorias_financas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      nome TEXT NOT NULL,
      cor TEXT NOT NULL,
      icone TEXT,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Transações (Receitas e Despesas)
  db.exec(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      data TEXT NOT NULL,
      valor REAL NOT NULL,
      descricao TEXT NOT NULL,
      categoriaId INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('receita', 'despesa')),
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (categoriaId) REFERENCES categorias_financas (id) ON DELETE CASCADE
    );
  `);

  // Tabela de Envelopes de Orçamento
  db.exec(`
    CREATE TABLE IF NOT EXISTS envelopes_orcamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      nome TEXT NOT NULL,
      cor TEXT,
      valorAlocado REAL NOT NULL,
      valorUtilizado REAL DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Pagamentos Recorrentes
  db.exec(`
    CREATE TABLE IF NOT EXISTS pagamentos_recorrentes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL,
      dataVencimento TEXT NOT NULL, -- Dia do mês
      categoriaId INTEGER NOT NULL,
      proximoPagamento TEXT, -- Data completa (YYYY-MM-DD)
      pago BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (categoriaId) REFERENCES categorias_financas (id) ON DELETE CASCADE
    );
  `);

  // --- Módulo Hiperfocos ---

  // Tabela de Hiperfocos (Projetos)
  db.exec(`
    CREATE TABLE IF NOT EXISTS hiperfocos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT,
      cor TEXT,
      dataCriacao TEXT NOT NULL,
      tempoLimite INTEGER, -- em minutos
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Tarefas (com suporte a subtarefas)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      hiperfocoId INTEGER NOT NULL,
      tarefaPaiId INTEGER, -- Chave estrangeira para a própria tabela (subtarefas)
      texto TEXT NOT NULL,
      concluida BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (hiperfocoId) REFERENCES hiperfocos (id) ON DELETE CASCADE,
      FOREIGN KEY (tarefaPaiId) REFERENCES tarefas (id) ON DELETE CASCADE
    );
  `);

  // Tabela de Sessões de Alternância de Foco
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessoes_alternancia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      hiperfocoAtualId INTEGER,
      hiperfocoAnteriorId INTEGER,
      tempoInicio TEXT NOT NULL,
      duracaoEstimada INTEGER, -- em minutos
      concluida BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (hiperfocoAtualId) REFERENCES hiperfocos (id) ON DELETE SET NULL,
      FOREIGN KEY (hiperfocoAnteriorId) REFERENCES hiperfocos (id) ON DELETE SET NULL
    );
  `);

  // --- Módulo Concursos ---

  // Tabela de Concursos
  db.exec(`
    CREATE TABLE IF NOT EXISTS concursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      organizadora TEXT,
      dataInscricao TEXT,
      dataProva TEXT,
      edital TEXT,
      status TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Conteúdo Programático
  db.exec(`
    CREATE TABLE IF NOT EXISTS conteudos_programaticos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concursoId INTEGER NOT NULL,
      disciplina TEXT NOT NULL,
      topicos TEXT, -- Armazenado como JSON array de strings
      progresso INTEGER DEFAULT 0,
      FOREIGN KEY (concursoId) REFERENCES concursos (id) ON DELETE CASCADE
    );
  `);

  // Tabela de Simulados Favoritos (associados a um concurso)
  db.exec(`
    CREATE TABLE IF NOT EXISTS simulados_favoritos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      concursoId INTEGER NOT NULL,
      nome TEXT NOT NULL,
      data TEXT NOT NULL,
      link TEXT,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (concursoId) REFERENCES concursos (id) ON DELETE CASCADE
    );
  `);

  // --- Módulo Questões (associado a Concursos) ---

  // Tabela de Questões
  db.exec(`
    CREATE TABLE IF NOT EXISTS questoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      concursoId INTEGER NOT NULL,
      disciplina TEXT,
      topico TEXT,
      enunciado TEXT NOT NULL,
      respostaCorretaId INTEGER, -- Será preenchido após inserir as alternativas
      justificativa TEXT,
      nivelDificuldade TEXT,
      ano INTEGER,
      banca TEXT,
      tags TEXT, -- Armazenado como JSON array de strings
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (concursoId) REFERENCES concursos (id) ON DELETE CASCADE
    );
  `);

  // Tabela de Alternativas
  db.exec(`
    CREATE TABLE IF NOT EXISTS alternativas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questaoId INTEGER NOT NULL,
      texto TEXT NOT NULL,
      -- A informação de 'correta' será inferida comparando com 'respostaCorretaId' na tabela 'questoes'
      FOREIGN KEY (questaoId) REFERENCES questoes (id) ON DELETE CASCADE
    );
  `);

  // --- Módulo Lazer ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS atividades_lazer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      nome TEXT NOT NULL,
      categoria TEXT,
      duracao INTEGER, -- em minutos
      observacoes TEXT,
      data TEXT NOT NULL,
      concluida BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Sugestões de Descanso Favoritas
  db.exec(`
    CREATE TABLE IF NOT EXISTS sugestoes_favoritas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      sugestao TEXT NOT NULL,
      UNIQUE(userId, sugestao),
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // --- Módulo Autoconhecimento ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS notas_autoconhecimento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      conteudo TEXT,
      secao TEXT NOT NULL CHECK(secao IN ('quem-sou', 'meus-porques', 'meus-padroes')),
      tags TEXT, -- Armazenado como JSON array de strings
      dataCriacao TEXT NOT NULL,
      dataAtualizacao TEXT NOT NULL,
      imagemUrl TEXT,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // --- Módulo Sono ---

  // Tabela de Registros de Sono
  db.exec(`
    CREATE TABLE IF NOT EXISTS registros_sono (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      inicio TEXT NOT NULL,
      fim TEXT,
      qualidade INTEGER,
      notas TEXT,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Tabela de Lembretes de Sono
  db.exec(`
    CREATE TABLE IF NOT EXISTS lembretes_sono (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('dormir', 'acordar')),
      horario TEXT NOT NULL,
      diasSemana TEXT NOT NULL, -- Armazenado como JSON array de números (0-6)
      ativo BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  console.log('Schema do banco de dados criado com sucesso.');
}

try {
  init();
} catch (error) {
  console.error('Falha ao inicializar o banco de dados:', error);
} finally {
  db.close();
}