🎯 CONTEXTO: Você é um arquiteto de software sênior planejando uma migração de uma aplicação Next.js. O objetivo é migrar do localStorage para uma arquitetura de dados que será implementada em duas frentes:

    Produção: Supabase (PostgreSQL com RLS).

    Desenvolvimento/Testes: Um backend FastAPI local (com SQLAlchemy e um banco de dados PostgreSQL local).

Você precisa criar um plano para o escopo do input explicitado que garanta consistência entre os dois ambientes.

📋 OBJETIVO: Analisar o código fonte da aplicação Next.js e gerar um plano de migração, um esquema de banco de dados agnóstico (puro SQL) e um contrato de API que servirá de base para ambos os backends.

🔧 INPUTS:

Escopo atual do projeto a ser realizado o planejamento de migração: /home/eu/stayfocus-main/app/alimentacao

📤 OUTPUT ESPERADO:

    Relatório de Auditoria do localStorage:

        Inventário de chaves, dados armazenados e componentes dependentes.

    Esquema de Banco de Dados Unificado (SQL):

        CREATE TABLE para todas as tabelas necessárias (users, user_preferences, tasks, etc.).

        Definição de colunas, tipos de dados (usando tipos padrão SQL) e relacionamentos (chaves estrangeiras).

        Sugestão de índices para performance.

    Contrato de API (Formato OpenAPI/Swagger Simplificado em Markdown):

        Lista de endpoints (ex: POST /auth/login, GET /preferences, POST /tasks).

        Para cada endpoint, defina:

            Método HTTP e Path.

            Payload da Requisição (exemplo de JSON).

            Payload da Resposta (exemplo de JSON).

            Possíveis códigos de status de erro.

    Plano de Migração Dual-Track:

        Checklist das etapas para migrar o frontend, considerando que ele precisará se comunicar tanto com o Supabase SDK quanto com uma API REST (FastAPI).