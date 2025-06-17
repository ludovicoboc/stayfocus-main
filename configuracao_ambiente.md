# ⚙️ Configuração de Ambiente - Migração Alimentação

## 1. Variáveis de Ambiente

### Arquivo `.env.local`
```bash
# Modo da API (supabase ou fastapi)
NEXT_PUBLIC_API_MODE=supabase

# Configurações do Supabase (Produção)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Configurações do FastAPI (Desenvolvimento)
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
FASTAPI_DATABASE_URL=postgresql://user:password@localhost:5432/stayfocus_dev

# Configurações de JWT (para FastAPI)
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Arquivo `.env.development`
```bash
NEXT_PUBLIC_API_MODE=fastapi
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

### Arquivo `.env.production`
```bash
NEXT_PUBLIC_API_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 2. Configuração do Supabase

### 2.1 Políticas RLS (Row Level Security)

```sql
-- Política para planned_meals
CREATE POLICY "Usuários podem ver suas próprias refeições planejadas"
ON planned_meals FOR ALL
USING (auth.uid() = user_id);

-- Política para meal_records
CREATE POLICY "Usuários podem ver seus próprios registros de refeições"
ON meal_records FOR ALL
USING (auth.uid() = user_id);

-- Política para hydration_records
CREATE POLICY "Usuários podem ver seus próprios registros de hidratação"
ON hydration_records FOR ALL
USING (auth.uid() = user_id);

-- Política para recipes
CREATE POLICY "Usuários podem ver suas próprias receitas"
ON recipes FOR ALL
USING (auth.uid() = user_id);

-- Política para recipe_ingredients
CREATE POLICY "Usuários podem ver ingredientes de suas receitas"
ON recipe_ingredients FOR ALL
USING (
  recipe_id IN (
    SELECT id FROM recipes WHERE user_id = auth.uid()
  )
);

-- Política para recipe_steps
CREATE POLICY "Usuários podem ver passos de suas receitas"
ON recipe_steps FOR ALL
USING (
  recipe_id IN (
    SELECT id FROM recipes WHERE user_id = auth.uid()
  )
);

-- Política para favorite_recipes
CREATE POLICY "Usuários podem ver suas receitas favoritas"
ON favorite_recipes FOR ALL
USING (auth.uid() = user_id);
```

### 2.2 Configuração de Storage

```sql
-- Bucket para fotos de refeições
INSERT INTO storage.buckets (id, name, public) VALUES ('meal-photos', 'meal-photos', true);

-- Política para upload de fotos
CREATE POLICY "Usuários podem fazer upload de fotos de refeições"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'meal-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para visualizar fotos
CREATE POLICY "Usuários podem ver suas fotos de refeições"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'meal-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2.3 Triggers e Funções

```sql
-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_planned_meals_updated_at
  BEFORE UPDATE ON planned_meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hydration_records_updated_at
  BEFORE UPDATE ON hydration_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 3. Configuração do FastAPI

### 3.1 Estrutura do Projeto FastAPI

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routes.py
│   ├── alimentacao/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routes.py
│   └── core/
│       ├── __init__.py
│       ├── security.py
│       └── deps.py
├── requirements.txt
└── alembic/
    ├── env.py
    └── versions/
```

### 3.2 Arquivo `requirements.txt`

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic==2.5.0
pydantic-settings==2.0.3
python-dotenv==1.0.0
```

### 3.3 Configuração Principal (`app/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.routes import router as auth_router
from app.alimentacao.routes import router as alimentacao_router

app = FastAPI(title="StayFocus API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(alimentacao_router, prefix="/api", tags=["alimentacao"])

@app.get("/")
async def root():
    return {"message": "StayFocus API - Módulo Alimentação"}
```

### 3.4 Configuração do Banco (`app/database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 3.5 Configuração (`app/config.py`)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/stayfocus_dev"
    JWT_SECRET_KEY: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## 4. Scripts de Inicialização

### 4.1 Docker Compose para Desenvolvimento

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: stayfocus_dev
      POSTGRES_USER: stayfocus
      POSTGRES_PASSWORD: password123
    ports:
      - "5432:5432"
    volumes:
      - ./postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  fastapi:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://stayfocus:password123@postgres:5432/stayfocus_dev
    depends_on:
      - postgres
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  postgres_data:
```

### 4.2 Script de Inicialização do Banco

```bash
#!/bin/bash
# scripts/setup-database.sh

echo "Iniciando configuração do banco de dados..."

# Criar banco se não existir
createdb stayfocus_dev 2>/dev/null || true

# Aplicar migrações
cd backend
alembic upgrade head

echo "Banco de dados configurado com sucesso!"
```

### 4.3 Script de Desenvolvimento

```bash
#!/bin/bash
# scripts/dev-start.sh

echo "Iniciando ambiente de desenvolvimento..."

# Iniciar containers
docker-compose up -d postgres redis

# Aguardar PostgreSQL iniciar
sleep 5

# Configurar banco
./scripts/setup-database.sh

# Iniciar FastAPI
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

# Iniciar Next.js
cd ..
npm run dev

echo "Ambiente de desenvolvimento iniciado!"
```

## 5. Configuração de CI/CD

### 5.1 GitHub Actions (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        NEXT_PUBLIC_API_MODE: supabase
    
    - name: Deploy to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 5.2 Scripts de Migração

```typescript
// scripts/migrate-supabase.ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function runMigration() {
  const sqlCommands = readFileSync('./sql/migration.sql', 'utf8')
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: sqlCommands })
    if (error) throw error
    console.log('Migração executada com sucesso!')
  } catch (error) {
    console.error('Erro na migração:', error)
    process.exit(1)
  }
}

runMigration()
```

## 6. Monitoramento e Logs

### 6.1 Configuração de Logs

```typescript
// utils/logger.ts
export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data)
  }
  
  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error)
  }
  
  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data)
  }
}
```

### 6.2 Monitoramento de Erros

```typescript
// services/error-monitoring.ts
export class ErrorMonitoring {
  static captureException(error: Error, context?: any) {
    // Integração com Sentry, LogRocket, etc.
    console.error('Erro capturado:', error, context)
    
    // Enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: context })
    }
  }
}
```

---

*Guia de configuração de ambiente para a migração do módulo de alimentação* 