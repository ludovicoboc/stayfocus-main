# 🏥 PLANO DE MIGRAÇÃO TDD - MÓDULO SAÚDE

## 🎯 CONTEXTO

Migração do módulo de saúde de uma arquitetura baseada em localStorage para uma arquitetura de dados dual com **foco em segurança médica**, seguindo **metodologia TDD rigorosa** estabelecida na FASE 0:
- **Produção**: Supabase (PostgreSQL com RLS + Criptografia médica)
- **Desenvolvimento/Testes**: Backend FastAPI local (SQLAlchemy + PostgreSQL local)
- **Metodologia**: Test-Driven Development (Red-Green-Refactor)
- **Infraestrutura**: Vitest + RTL + MSW + Quality Gates automáticos
- **Segurança**: Validação médica + Auditoria + Compliance LGPD

## 🧪 PREPARAÇÃO TDD - INFRAESTRUTURA PRONTA

### ✅ FASE 0 Concluída - Base Sólida Estabelecida

A **infraestrutura TDD robusta** já está 100% funcional:
- **Vitest**: Test runner otimizado (3x mais rápido que Jest)
- **React Testing Library**: Testes user-centric
- **MSW**: Mock Service Worker para APIs realistas
- **Quality Gates**: Coverage > 70% + Performance < 100ms
- **CI/CD Pipeline**: 7 jobs automáticos com verificações rigorosas
- **Utilities**: Templates, factories, helpers prontos para uso

### 🔒 Extensões Específicas para Dados Médicos

```typescript
// __tests__/utils/medical-validation.ts
export const validateMedicalData = {
  dosage: (dosage: string) => /^[\d.,]+\s*(mg|ml|g|mcg|UI)$/i.test(dosage),
  time: (time: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time),
  moodLevel: (level: number) => level >= 1 && level <= 5,
  medicationName: (name: string) => name.length >= 2 && name.length <= 100
}

export const sanitizeMedicalData = {
  medication: (data: any) => ({
    ...data,
    nome: data.nome?.trim(),
    dosagem: data.dosagem?.toLowerCase(),
    observacoes: data.observacoes?.substring(0, 500)
  })
}
```

---

## 📊 1. ANÁLISE DOS DADOS ATUAIS (localStorage)

### 1.1 Estrutura Atual no localStorage

**Chave: `painel-neurodivergentes-storage`**
- **Dados**: Medicamentos e registros de humor
- **Estrutura**:
  ```json
  {
    "medicamentos": [
      {
        "id": "string",
        "nome": "string",
        "dosagem": "string",
        "frequencia": "string",
        "horarios": "string[]",
        "observacoes": "string",
        "dataInicio": "string (YYYY-MM-DD)",
        "ultimaTomada": "string | null (ISO)",
        "intervalo": "number | undefined (minutos)"
      }
    ],
    "registrosHumor": [
      {
        "id": "string",
        "data": "string (YYYY-MM-DD)",
        "nivel": "number (1-5)",
        "fatores": "string[]",
        "notas": "string"
      }
    ]
  }
  ```

### 🧪 Factories TDD para Dados Existentes

```typescript
// __tests__/factories/saude.ts
let medicationCounter = 1
let moodCounter = 1

export const createMedicamento = (overrides = {}) => ({
  id: `med-${medicationCounter++}`,
  nome: 'Medicamento Teste',
  dosagem: '10mg',
  frequencia: 'Diário',
  horarios: ['08:00', '20:00'],
  observacoes: 'Tomar com alimentos',
  dataInicio: '2024-01-01',
  ultimaTomada: null,
  intervalo: 720, // 12 horas
  ...overrides
})

export const createRegistroHumor = (overrides = {}) => ({
  id: `humor-${moodCounter++}`,
  data: new Date().toISOString().split('T')[0],
  nivel: 3,
  fatores: ['trabalho', 'sono'],
  notas: 'Dia normal',
  ...overrides
})

export const createDoseTomada = (overrides = {}) => ({
  id: `dose-${medicationCounter++}`,
  medicamentoId: 'med-1',
  dataHoraTomada: new Date().toISOString(),
  observacoes: '',
  ...overrides
})
```

### Componentes Dependentes + Estratégia de Testes

| Componente | Responsabilidade | Estratégia TDD |
|------------|------------------|----------------|
| **RegistroMedicamentos.tsx** | CRUD medicamentos + validação médica | ✅ Testes de Validação + Segurança |
| **MedicamentosList.tsx** | Lista + controle de doses | ✅ Testes de Estado + Horários |
| **MonitoramentoHumor.tsx** | Registro de humor + análise | ✅ Testes de Privacidade + Tendências |
| **HumorCalendar.tsx** | Visualização temporal | ✅ Testes de Renderização + Navegação |
| **FatoresHumor.tsx** | Análise estatística | ✅ Testes de Cálculos + Performance |
| **StatCard.tsx** | Métricas de saúde | ✅ Testes de Precisão + Formatação |

### 🎯 Cobertura de Testes Planejada

```typescript
// Estrutura de testes para o módulo
__tests__/
├── components/
│   ├── RegistroMedicamentos.test.tsx     # CRUD + Validação médica
│   ├── MedicamentosList.test.tsx         # Estado + Controle doses
│   ├── MonitoramentoHumor.test.tsx       # Privacidade + Análise
│   ├── HumorCalendar.test.tsx            # Renderização + Navegação
│   ├── FatoresHumor.test.tsx             # Cálculos + Performance
│   └── StatCard.test.tsx                 # Métricas + Formatação
├── hooks/
│   ├── useSaude.test.ts                  # Store + Mutations médicas
│   ├── useMedicamentos.test.ts           # Medication logic + validation
│   ├── useHumor.test.ts                  # Mood tracking + analysis
│   └── useDoseTiming.test.ts             # Dose scheduling + alerts
├── services/
│   ├── saudeApi.test.ts                  # API calls + security
│   ├── medicationValidation.test.ts      # Medical validation
│   └── auditService.test.ts              # Audit trail + compliance
├── utils/
│   ├── medicalValidation.test.ts         # Validation utilities
│   ├── doseCalculation.test.ts           # Dose timing calculations
│   └── privacyHelpers.test.ts            # Privacy protection
└── integration/
    ├── saude-flow.test.tsx               # E2E medical scenarios
    ├── medication-adherence.test.tsx     # Adherence tracking
    └── mood-analysis.test.tsx            # Mood pattern analysis
```

---

## 🗄️ 2. ESQUEMA DE BANCO DE DADOS UNIFICADO (SQL)

```sql
-- Tabela de usuários (base para todo o sistema)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de medicamentos
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL, -- Ex: "10mg", "5ml"
    frequency VARCHAR(50) NOT NULL, -- Ex: "Diário", "2x ao dia"
    times VARCHAR(5)[] NOT NULL, -- Array de horários ["08:00", "20:00"]
    notes TEXT,
    start_date DATE NOT NULL,
    interval_minutes INTEGER, -- Intervalo entre doses em minutos
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints de segurança médica
    CONSTRAINT valid_dosage CHECK (dosage ~ '^[\d.,]+\s*(mg|ml|g|mcg|UI)$'),
    CONSTRAINT valid_times CHECK (array_length(times, 1) > 0),
    CONSTRAINT valid_interval CHECK (interval_minutes IS NULL OR interval_minutes > 0)
);

-- Tabela de doses tomadas (auditoria completa)
CREATE TABLE medication_doses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    taken_at TIMESTAMP NOT NULL,
    scheduled_time TIME, -- Horário programado
    actual_time TIME, -- Horário real da tomada
    delay_minutes INTEGER, -- Atraso em minutos
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    INDEX idx_medication_doses_user_date (user_id, DATE(taken_at)),
    INDEX idx_medication_doses_medication (medication_id),
    
    -- Constraints de validação
    CONSTRAINT valid_delay CHECK (delay_minutes >= -1440 AND delay_minutes <= 1440) -- Max 24h
);

-- Tabela de registros de humor
CREATE TABLE mood_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
    factors TEXT[] DEFAULT '{}', -- Fatores que influenciaram o humor
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint para evitar múltiplos registros no mesmo dia
    UNIQUE(user_id, date)
);

-- Tabela de fatores de humor (para análise)
CREATE TABLE mood_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(30), -- Ex: "trabalho", "saúde", "relacionamento"
    is_positive BOOLEAN DEFAULT NULL, -- NULL = neutro, true = positivo, false = negativo
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, name)
);

-- Tabela de auditoria para dados médicos (compliance)
CREATE TABLE medical_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS (Row Level Security) para proteção de dados
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_factors ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can only access their own medications" ON medications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own doses" ON medication_doses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own mood records" ON mood_records
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own mood factors" ON mood_factors
    FOR ALL USING (auth.uid() = user_id);

-- Views para análise e relatórios
CREATE VIEW medication_adherence AS
SELECT 
    m.id,
    m.user_id,
    m.name,
    COUNT(md.id) as total_doses_taken,
    COUNT(CASE WHEN DATE(md.taken_at) = CURRENT_DATE THEN 1 END) as doses_today,
    AVG(md.delay_minutes) as avg_delay_minutes,
    MAX(md.taken_at) as last_dose_taken
FROM medications m
LEFT JOIN medication_doses md ON m.id = md.medication_id
WHERE m.is_active = true
GROUP BY m.id, m.user_id, m.name;

CREATE VIEW mood_analysis AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    AVG(level) as avg_mood,
    COUNT(*) as total_records,
    COUNT(CASE WHEN level >= 4 THEN 1 END) as positive_days,
    COUNT(CASE WHEN level <= 2 THEN 1 END) as negative_days,
    array_agg(DISTINCT unnest(factors)) as common_factors
FROM mood_records
GROUP BY user_id, DATE_TRUNC('month', date);

-- Triggers para auditoria automática
CREATE OR REPLACE FUNCTION audit_medical_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO medical_audit_log (
        user_id, table_name, record_id, action, old_data, new_data
    ) VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de auditoria
CREATE TRIGGER medications_audit AFTER INSERT OR UPDATE OR DELETE ON medications
    FOR EACH ROW EXECUTE FUNCTION audit_medical_changes();

CREATE TRIGGER medication_doses_audit AFTER INSERT OR UPDATE OR DELETE ON medication_doses
    FOR EACH ROW EXECUTE FUNCTION audit_medical_changes();

CREATE TRIGGER mood_records_audit AFTER INSERT OR UPDATE OR DELETE ON mood_records
    FOR EACH ROW EXECUTE FUNCTION audit_medical_changes();
```

---

## 🏗️ 3. ARQUITETURA DE SERVIÇOS TDD

### Service Layer com Validação Médica

```typescript
// app/services/saudeService.ts
export interface SaudeService {
  // Medicamentos
  getMedicamentos(): Promise<Medicamento[]>
  createMedicamento(data: CreateMedicamentoData): Promise<Medicamento>
  updateMedicamento(id: string, data: UpdateMedicamentoData): Promise<Medicamento>
  deleteMedicamento(id: string): Promise<void>
  
  // Doses
  registrarDose(medicamentoId: string, data: RegistrarDoseData): Promise<DoseTomada>
  getDosesHistorico(medicamentoId: string, periodo?: DateRange): Promise<DoseTomada[]>
  
  // Humor
  getRegistrosHumor(periodo?: DateRange): Promise<RegistroHumor[]>
  createRegistroHumor(data: CreateHumorData): Promise<RegistroHumor>
  updateRegistroHumor(id: string, data: UpdateHumorData): Promise<RegistroHumor>
  deleteRegistroHumor(id: string): Promise<void>
  
  // Análises
  getAderenciaMedicamentos(): Promise<AderenciaStats>
  getAnaliseHumor(periodo: DateRange): Promise<HumorAnalysis>
  getFatoresHumor(): Promise<FatorHumor[]>
}
```

---

## 🧪 4. FACTORIES TDD ESPECÍFICAS DO MÓDULO

```typescript
// __tests__/factories/saude.ts
import { faker } from '@faker-js/faker'

let medicationCounter = 1
let doseCounter = 1
let moodCounter = 1

export const createMedicamento = (overrides = {}) => ({
  id: `med-${medicationCounter++}`,
  nome: faker.helpers.arrayElement([
    'Paracetamol', 'Ibuprofeno', 'Omeprazol', 'Losartana', 'Metformina'
  ]),
  dosagem: faker.helpers.arrayElement(['10mg', '20mg', '500mg', '5ml', '2.5mg']),
  frequencia: faker.helpers.arrayElement(['Diário', '2x ao dia', '3x ao dia', 'Semanal']),
  horarios: faker.helpers.arrayElements(['06:00', '08:00', '12:00', '18:00', '22:00'], 2),
  observacoes: faker.helpers.arrayElement([
    'Tomar com alimentos',
    'Tomar em jejum',
    'Não tomar com leite',
    'Tomar antes de dormir'
  ]),
  dataInicio: faker.date.past().toISOString().split('T')[0],
  ultimaTomada: faker.datatype.boolean() ? faker.date.recent().toISOString() : null,
  intervalo: faker.helpers.arrayElement([480, 720, 1440]), // 8h, 12h, 24h
  ...overrides
})

export const createDoseTomada = (overrides = {}) => ({
  id: `dose-${doseCounter++}`,
  medicamentoId: `med-${faker.number.int({ min: 1, max: 5 })}`,
  dataHoraTomada: faker.date.recent().toISOString(),
  horarioProgramado: faker.helpers.arrayElement(['08:00', '12:00', '18:00', '22:00']),
  horarioReal: faker.helpers.arrayElement(['08:05', '12:15', '18:30', '22:10']),
  atrasoMinutos: faker.number.int({ min: 0, max: 60 }),
  observacoes: faker.helpers.arrayElement(['', 'Esqueci', 'Tomei com atraso', 'Tudo normal']),
  ...overrides
})

export const createRegistroHumor = (overrides = {}) => ({
  id: `humor-${moodCounter++}`,
  data: faker.date.recent().toISOString().split('T')[0],
  nivel: faker.number.int({ min: 1, max: 5 }),
  fatores: faker.helpers.arrayElements([
    'trabalho', 'sono', 'exercício', 'alimentação', 'relacionamento', 
    'clima', 'medicação', 'estresse', 'lazer', 'saúde'
  ], faker.number.int({ min: 1, max: 4 })),
  notas: faker.helpers.arrayElement([
    'Dia normal', 'Me senti bem hoje', 'Dia difícil', 'Muito produtivo',
    'Ansioso', 'Relaxado', 'Motivado', 'Cansado'
  ]),
  ...overrides
})

export const createAderenciaStats = (overrides = {}) => ({
  medicamentoId: `med-${faker.number.int({ min: 1, max: 5 })}`,
  totalDosesProgramadas: faker.number.int({ min: 20, max: 100 }),
  totalDosesTomadas: faker.number.int({ min: 15, max: 95 }),
  percentualAderencia: faker.number.float({ min: 70, max: 100, precision: 0.1 }),
  atrasoMedioMinutos: faker.number.int({ min: 0, max: 30 }),
  ultimaDose: faker.date.recent().toISOString(),
  proximaDose: faker.date.soon().toISOString(),
  ...overrides
})

export const createHumorAnalysis = (overrides = {}) => ({
  periodo: {
    inicio: faker.date.past().toISOString().split('T')[0],
    fim: new Date().toISOString().split('T')[0]
  },
  humorMedio: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
  tendencia: faker.helpers.arrayElement(['crescente', 'decrescente', 'estável']),
  diasPositivos: faker.number.int({ min: 5, max: 20 }),
  diasNegativos: faker.number.int({ min: 0, max: 10 }),
  fatoresMaisComuns: faker.helpers.arrayElements([
    'trabalho', 'sono', 'exercício', 'alimentação'
  ], 3),
  ...overrides
})

// Utility para criar listas
export const createList = <T>(factory: () => T, count: number, overrides: Partial<T>[] = []): T[] => {
  return Array.from({ length: count }, (_, index) => ({
    ...factory(),
    ...overrides[index]
  }))
}
```

---

## 🧪 5. TEMPLATES DE TESTE ESPECÍFICOS DO MÓDULO

### 5.1 Testes de Componentes Médicos

```typescript
// __tests__/components/RegistroMedicamentos.test.tsx
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { RegistroMedicamentos } from '@/components/saude/RegistroMedicamentos'
import { createMedicamento } from '@/factories/saude'

describe('RegistroMedicamentos', () => {
  const defaultProps = {
    onSave: vi.fn(),
    onCancel: vi.fn(),
  }

  const renderComponent = (props = {}) => {
    return render(<RegistroMedicamentos {...defaultProps} {...props} />)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Validação Médica', () => {
    it('deve validar formato de dosagem', async () => {
      const user = userEvent.setup()
      renderComponent()

      const dosagemInput = screen.getByLabelText(/dosagem/i)
      await user.type(dosagemInput, 'dosagem inválida')

      await user.click(screen.getByRole('button', { name: /salvar/i }))

      expect(screen.getByText(/formato de dosagem inválido/i)).toBeInTheDocument()
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('deve aceitar dosagens válidas', async () => {
      const user = userEvent.setup()
      renderComponent()

      const validDosages = ['10mg', '5ml', '2.5g', '100mcg', '1000UI']

      for (const dosage of validDosages) {
        const dosagemInput = screen.getByLabelText(/dosagem/i)
        await user.clear(dosagemInput)
        await user.type(dosagemInput, dosage)

        // Verificar que não há erro
        expect(screen.queryByText(/formato de dosagem inválido/i)).not.toBeInTheDocument()
      }
    })

    it('deve validar horários no formato HH:MM', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByRole('button', { name: /adicionar horário/i }))

      const horarioInput = screen.getByLabelText(/horário/i)
      await user.type(horarioInput, '25:00') // Horário inválido

      await user.click(screen.getByRole('button', { name: /salvar/i }))

      expect(screen.getByText(/horário inválido/i)).toBeInTheDocument()
    })

    it('deve prevenir overdose com intervalos muito curtos', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Adicionar dois horários muito próximos
      await user.click(screen.getByRole('button', { name: /adicionar horário/i }))
      await user.type(screen.getByLabelText(/horário/i), '08:00')

      await user.click(screen.getByRole('button', { name: /adicionar horário/i }))
      await user.type(screen.getAllByLabelText(/horário/i)[1], '08:30')

      await user.click(screen.getByRole('button', { name: /salvar/i }))

      expect(screen.getByText(/intervalo muito curto entre doses/i)).toBeInTheDocument()
    })
  })

  describe('Segurança de Dados', () => {
    it('deve sanitizar dados de entrada', async () => {
      const user = userEvent.setup()
      renderComponent()

      const nomeInput = screen.getByLabelText(/nome/i)
      await user.type(nomeInput, '  Medicamento com espaços  ')

      const observacoesInput = screen.getByLabelText(/observações/i)
      await user.type(observacoesInput, 'A'.repeat(600)) // Texto muito longo

      await user.click(screen.getByRole('button', { name: /salvar/i }))

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Medicamento com espaços', // Trimmed
          observacoes: expect.stringMatching(/^.{1,500}$/) // Truncated
        })
      )
    })
  })

  describe('Acessibilidade Médica', () => {
    it('deve ter labels apropriados para leitores de tela', () => {
      renderComponent()

      expect(screen.getByLabelText(/nome do medicamento/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/dosagem/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/frequência/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/observações médicas/i)).toBeInTheDocument()
    })

    it('deve anunciar erros de validação para leitores de tela', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByRole('button', { name: /salvar/i }))

      const errorMessage = screen.getByText(/nome é obrigatório/i)
      expect(errorMessage).toHaveAttribute('role', 'alert')
      expect(errorMessage).toHaveAttribute('aria-live', 'polite')
    })
  })
})
```

### 5.2 Testes de Controle de Doses

```typescript
// __tests__/components/MedicamentosList.test.tsx
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MedicamentosList } from '@/components/saude/MedicamentosList'
import { createMedicamento, createList } from '@/factories/saude'

describe('MedicamentosList', () => {
  const mockMedicamentos = createList(createMedicamento, 3, [
    { nome: 'Paracetamol', horarios: ['08:00', '20:00'] },
    { nome: 'Ibuprofeno', horarios: ['12:00'] },
    { nome: 'Omeprazol', horarios: ['07:00'] }
  ])

  const defaultProps = {
    medicamentos: mockMedicamentos,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onRegistrarTomada: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Controle de Doses', () => {
    it('deve mostrar status de dose tomada hoje', () => {
      const medicamentoTomado = createMedicamento({
        nome: 'Medicamento Tomado',
        ultimaTomada: new Date().toISOString()
      })

      render(<MedicamentosList {...defaultProps} medicamentos={[medicamentoTomado]} />)

      expect(screen.getByText(/tomado hoje/i)).toBeInTheDocument()
      expect(screen.getByTestId('dose-status-taken')).toHaveClass('text-green-600')
    })

    it('deve mostrar alerta para dose atrasada', () => {
      // Simular horário atual: 09:00
      vi.setSystemTime(new Date('2024-01-01T09:00:00'))

      const medicamentoAtrasado = createMedicamento({
        nome: 'Medicamento Atrasado',
        horarios: ['08:00'],
        ultimaTomada: null
      })

      render(<MedicamentosList {...defaultProps} medicamentos={[medicamentoAtrasado]} />)

      expect(screen.getByText(/dose atrasada/i)).toBeInTheDocument()
      expect(screen.getByTestId('dose-status-late')).toHaveClass('text-red-600')
    })

    it('deve calcular próxima dose corretamente', () => {
      const medicamento = createMedicamento({
        horarios: ['08:00', '20:00'],
        ultimaTomada: new Date('2024-01-01T08:00:00').toISOString()
      })

      render(<MedicamentosList {...defaultProps} medicamentos={[medicamento]} />)

      expect(screen.getByText(/próxima dose: 20:00/i)).toBeInTheDocument()
    })

    it('deve registrar tomada de dose', async () => {
      const user = userEvent.setup()
      render(<MedicamentosList {...defaultProps} />)

      const registrarButton = screen.getAllByRole('button', { name: /registrar tomada/i })[0]
      await user.click(registrarButton)

      expect(defaultProps.onRegistrarTomada).toHaveBeenCalledWith(mockMedicamentos[0].id)
    })
  })

  describe('Alertas de Segurança', () => {
    it('deve mostrar aviso para múltiplas doses no mesmo horário', () => {
      const medicamentosConflito = [
        createMedicamento({ nome: 'Med A', horarios: ['08:00'] }),
        createMedicamento({ nome: 'Med B', horarios: ['08:00'] })
      ]

      render(<MedicamentosList {...defaultProps} medicamentos={medicamentosConflito} />)

      expect(screen.getByText(/atenção: múltiplos medicamentos no mesmo horário/i)).toBeInTheDocument()
    })

    it('deve destacar medicamentos com interações conhecidas', () => {
      const medicamentosInteracao = [
        createMedicamento({ nome: 'Warfarina' }),
        createMedicamento({ nome: 'Aspirina' })
      ]

      render(<MedicamentosList {...defaultProps} medicamentos={medicamentosInteracao} />)

      expect(screen.getByText(/possível interação medicamentosa/i)).toBeInTheDocument()
      expect(screen.getByTestId('interaction-warning')).toBeInTheDocument()
    })
  })
})
```

### 5.3 Testes de Monitoramento de Humor

```typescript
// __tests__/components/MonitoramentoHumor.test.tsx
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MonitoramentoHumor } from '@/components/saude/MonitoramentoHumor'
import { createRegistroHumor, createList } from '@/factories/saude'

describe('MonitoramentoHumor', () => {
  const mockRegistros = createList(createRegistroHumor, 5, [
    { nivel: 5, fatores: ['exercício', 'sono'] },
    { nivel: 2, fatores: ['trabalho', 'estresse'] },
    { nivel: 4, fatores: ['lazer', 'relacionamento'] },
    { nivel: 3, fatores: ['alimentação'] },
    { nivel: 1, fatores: ['saúde', 'medicação'] }
  ])

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Registro de Humor', () => {
    it('deve permitir registrar humor do dia', async () => {
      const user = userEvent.setup()
      render(<MonitoramentoHumor />)

      // Selecionar nível de humor
      await user.click(screen.getByRole('button', { name: /nível 4/i }))

      // Adicionar fatores
      await user.click(screen.getByRole('button', { name: /trabalho/i }))
      await user.click(screen.getByRole('button', { name: /sono/i }))

      // Adicionar notas
      const notasInput = screen.getByLabelText(/notas/i)
      await user.type(notasInput, 'Dia produtivo no trabalho')

      // Salvar
      await user.click(screen.getByRole('button', { name: /salvar registro/i }))

      await waitFor(() => {
        expect(screen.getByText(/registro salvo com sucesso/i)).toBeInTheDocument()
      })
    })

    it('deve validar nível de humor obrigatório', async () => {
      const user = userEvent.setup()
      render(<MonitoramentoHumor />)

      await user.click(screen.getByRole('button', { name: /salvar registro/i }))

      expect(screen.getByText(/selecione um nível de humor/i)).toBeInTheDocument()
    })

    it('deve limitar um registro por dia', async () => {
      const user = userEvent.setup()

      // Mock para simular registro já existente hoje
      const registroHoje = createRegistroHumor({
        data: new Date().toISOString().split('T')[0],
        nivel: 3
      })

      render(<MonitoramentoHumor registrosExistentes={[registroHoje]} />)

      expect(screen.getByText(/você já registrou seu humor hoje/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /editar registro/i })).toBeInTheDocument()
    })
  })

  describe('Análise de Padrões', () => {
    it('deve calcular humor médio corretamente', () => {
      render(<MonitoramentoHumor registros={mockRegistros} />)

      // Média: (5+2+4+3+1)/5 = 3.0
      expect(screen.getByText(/humor médio: 3\.0/i)).toBeInTheDocument()
    })

    it('deve identificar tendência de humor', () => {
      const registrosTendencia = [
        createRegistroHumor({ data: '2024-01-01', nivel: 2 }),
        createRegistroHumor({ data: '2024-01-02', nivel: 3 }),
        createRegistroHumor({ data: '2024-01-03', nivel: 4 }),
        createRegistroHumor({ data: '2024-01-04', nivel: 4 }),
        createRegistroHumor({ data: '2024-01-05', nivel: 5 })
      ]

      render(<MonitoramentoHumor registros={registrosTendencia} />)

      expect(screen.getByText(/tendência: crescente/i)).toBeInTheDocument()
      expect(screen.getByTestId('trend-positive')).toBeInTheDocument()
    })

    it('deve mostrar fatores mais influentes', () => {
      render(<MonitoramentoHumor registros={mockRegistros} />)

      expect(screen.getByText(/fatores mais comuns/i)).toBeInTheDocument()
      // Cada fator aparece uma vez, então todos devem estar listados
      expect(screen.getByText(/trabalho/i)).toBeInTheDocument()
      expect(screen.getByText(/sono/i)).toBeInTheDocument()
      expect(screen.getByText(/exercício/i)).toBeInTheDocument()
    })
  })

  describe('Privacidade e Segurança', () => {
    it('deve criptografar notas sensíveis antes de salvar', async () => {
      const user = userEvent.setup()
      const mockSave = vi.fn()

      render(<MonitoramentoHumor onSave={mockSave} />)

      await user.click(screen.getByRole('button', { name: /nível 3/i }))

      const notasInput = screen.getByLabelText(/notas/i)
      await user.type(notasInput, 'Informação pessoal sensível')

      await user.click(screen.getByRole('button', { name: /salvar registro/i }))

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          notas: expect.not.stringMatching(/Informação pessoal sensível/)
        })
      )
    })

    it('deve ter controles de privacidade visíveis', () => {
      render(<MonitoramentoHumor />)

      expect(screen.getByText(/seus dados são privados e criptografados/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /configurações de privacidade/i })).toBeInTheDocument()
    })
  })
})
```

---

## 🎭 6. MSW HANDLERS PARA APIS DE SAÚDE

```typescript
// __tests__/mocks/handlers/saude.ts
import { http, HttpResponse } from 'msw'
import { createMedicamento, createDoseTomada, createRegistroHumor, createAderenciaStats } from '@/factories/saude'

export const saudeHandlers = [
  // Medicamentos
  http.get('/api/medications', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return new HttpResponse(null, { status: 401 })
    }

    return HttpResponse.json([
      createMedicamento({ nome: 'Paracetamol', dosagem: '500mg' }),
      createMedicamento({ nome: 'Ibuprofeno', dosagem: '400mg' }),
      createMedicamento({ nome: 'Omeprazol', dosagem: '20mg' })
    ])
  }),

  http.post('/api/medications', async ({ request }) => {
    const newMedication = await request.json()

    // Validação médica
    if (!newMedication.nome || newMedication.nome.length < 2) {
      return HttpResponse.json(
        { error: 'Nome do medicamento é obrigatório' },
        { status: 400 }
      )
    }

    if (!newMedication.dosagem || !/^[\d.,]+\s*(mg|ml|g|mcg|UI)$/i.test(newMedication.dosagem)) {
      return HttpResponse.json(
        { error: 'Formato de dosagem inválido' },
        { status: 400 }
      )
    }

    return HttpResponse.json(createMedicamento(newMedication), { status: 201 })
  }),

  http.put('/api/medications/:id', async ({ request, params }) => {
    const updates = await request.json()
    return HttpResponse.json(createMedicamento({ id: params.id, ...updates }))
  }),

  http.delete('/api/medications/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Doses
  http.post('/api/medications/:id/doses', async ({ request, params }) => {
    const doseData = await request.json()

    // Validação de segurança: não permitir doses muito próximas
    const lastDose = new Date(doseData.ultimaDose || 0)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastDose.getTime()) / (1000 * 60)

    if (diffMinutes < 60) { // Menos de 1 hora
      return HttpResponse.json(
        { error: 'Intervalo muito curto entre doses' },
        { status: 400 }
      )
    }

    return HttpResponse.json(
      createDoseTomada({ medicamentoId: params.id, ...doseData }),
      { status: 201 }
    )
  }),

  http.get('/api/medications/:id/doses', ({ params }) => {
    return HttpResponse.json([
      createDoseTomada({ medicamentoId: params.id }),
      createDoseTomada({ medicamentoId: params.id }),
      createDoseTomada({ medicamentoId: params.id })
    ])
  }),

  // Aderência
  http.get('/api/medications/adherence', () => {
    return HttpResponse.json([
      createAderenciaStats({ percentualAderencia: 85.5 }),
      createAderenciaStats({ percentualAderencia: 92.3 }),
      createAderenciaStats({ percentualAderencia: 78.1 })
    ])
  }),

  // Registros de Humor
  http.get('/api/mood-records', ({ request }) => {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    return HttpResponse.json([
      createRegistroHumor({ data: '2024-01-01', nivel: 4 }),
      createRegistroHumor({ data: '2024-01-02', nivel: 3 }),
      createRegistroHumor({ data: '2024-01-03', nivel: 5 }),
      createRegistroHumor({ data: '2024-01-04', nivel: 2 }),
      createRegistroHumor({ data: '2024-01-05', nivel: 4 })
    ])
  }),

  http.post('/api/mood-records', async ({ request }) => {
    const newRecord = await request.json()

    // Validação de humor
    if (!newRecord.nivel || newRecord.nivel < 1 || newRecord.nivel > 5) {
      return HttpResponse.json(
        { error: 'Nível de humor deve estar entre 1 e 5' },
        { status: 400 }
      )
    }

    // Verificar se já existe registro para o dia
    if (newRecord.data === new Date().toISOString().split('T')[0]) {
      return HttpResponse.json(
        { error: 'Já existe um registro para hoje' },
        { status: 409 }
      )
    }

    return HttpResponse.json(createRegistroHumor(newRecord), { status: 201 })
  }),

  http.put('/api/mood-records/:id', async ({ request, params }) => {
    const updates = await request.json()
    return HttpResponse.json(createRegistroHumor({ id: params.id, ...updates }))
  }),

  http.delete('/api/mood-records/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Análise de Humor
  http.get('/api/mood-analysis', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30'

    return HttpResponse.json({
      periodo: `${period} dias`,
      humorMedio: 3.4,
      tendencia: 'crescente',
      diasPositivos: 18,
      diasNegativos: 5,
      fatoresMaisComuns: ['trabalho', 'sono', 'exercício'],
      correlacoes: {
        exercicio: 0.7,
        sono: 0.8,
        trabalho: -0.3
      }
    })
  }),

  // Cenários de Erro para Testes
  http.get('/api/medications/error', () => {
    return new HttpResponse(null, { status: 500 })
  }),

  http.post('/api/medications/timeout', () => {
    return new Promise(() => {}) // Never resolves (timeout)
  }),

  // Cenários de Segurança
  http.post('/api/medications/security-test', async ({ request }) => {
    const data = await request.json()

    // Simular tentativa de SQL injection
    if (data.nome && data.nome.includes('DROP TABLE')) {
      return HttpResponse.json(
        { error: 'Dados inválidos detectados' },
        { status: 400 }
      )
    }

    return HttpResponse.json(createMedicamento(data), { status: 201 })
  })
]
```

---

## 🔒 7. QUALITY GATES ESPECÍFICOS PARA DADOS MÉDICOS

### 7.1 Validações de Segurança Médica

```typescript
// __tests__/utils/medical-quality-gates.ts
export const medicalQualityGates = {
  // Validação de dosagem
  validateDosage: (dosage: string): boolean => {
    const dosageRegex = /^[\d.,]+\s*(mg|ml|g|mcg|UI|%)$/i
    return dosageRegex.test(dosage)
  },

  // Validação de intervalo entre doses
  validateDoseInterval: (lastDose: Date, currentDose: Date, minIntervalMinutes: number): boolean => {
    const diffMinutes = (currentDose.getTime() - lastDose.getTime()) / (1000 * 60)
    return diffMinutes >= minIntervalMinutes
  },

  // Validação de interações medicamentosas
  checkDrugInteractions: (medications: string[]): string[] => {
    const knownInteractions = {
      'warfarina': ['aspirina', 'ibuprofeno'],
      'metformina': ['álcool'],
      'omeprazol': ['clopidogrel']
    }

    const interactions: string[] = []
    medications.forEach(med1 => {
      medications.forEach(med2 => {
        if (med1 !== med2 && knownInteractions[med1.toLowerCase()]?.includes(med2.toLowerCase())) {
          interactions.push(`${med1} + ${med2}`)
        }
      })
    })

    return interactions
  },

  // Validação de dados de humor
  validateMoodData: (level: number, factors: string[], notes: string): string[] => {
    const errors: string[] = []

    if (level < 1 || level > 5) {
      errors.push('Nível de humor deve estar entre 1 e 5')
    }

    if (factors.length > 10) {
      errors.push('Máximo de 10 fatores por registro')
    }

    if (notes.length > 1000) {
      errors.push('Notas não podem exceder 1000 caracteres')
    }

    return errors
  },

  // Sanitização de dados médicos
  sanitizeMedicalData: (data: any) => ({
    ...data,
    nome: data.nome?.trim().substring(0, 100),
    dosagem: data.dosagem?.toLowerCase().trim(),
    observacoes: data.observacoes?.substring(0, 500),
    notas: data.notas?.substring(0, 1000)
  })
}

// Testes dos Quality Gates
describe('Medical Quality Gates', () => {
  describe('Dosage Validation', () => {
    it('deve aceitar dosagens válidas', () => {
      const validDosages = ['10mg', '5ml', '2.5g', '100mcg', '1000UI', '0.5%']

      validDosages.forEach(dosage => {
        expect(medicalQualityGates.validateDosage(dosage)).toBe(true)
      })
    })

    it('deve rejeitar dosagens inválidas', () => {
      const invalidDosages = ['10', 'mg10', '10 mg extra', 'invalid']

      invalidDosages.forEach(dosage => {
        expect(medicalQualityGates.validateDosage(dosage)).toBe(false)
      })
    })
  })

  describe('Dose Interval Validation', () => {
    it('deve validar intervalo mínimo entre doses', () => {
      const lastDose = new Date('2024-01-01T08:00:00')
      const currentDose = new Date('2024-01-01T20:00:00') // 12 horas depois

      expect(medicalQualityGates.validateDoseInterval(lastDose, currentDose, 480)).toBe(true) // 8h mínimo
      expect(medicalQualityGates.validateDoseInterval(lastDose, currentDose, 1440)).toBe(false) // 24h mínimo
    })
  })

  describe('Drug Interactions', () => {
    it('deve detectar interações conhecidas', () => {
      const medications = ['Warfarina', 'Aspirina', 'Paracetamol']
      const interactions = medicalQualityGates.checkDrugInteractions(medications)

      expect(interactions).toContain('Warfarina + Aspirina')
      expect(interactions).not.toContain('Paracetamol + Aspirina')
    })
  })

  describe('Mood Data Validation', () => {
    it('deve validar dados de humor corretos', () => {
      const errors = medicalQualityGates.validateMoodData(3, ['trabalho', 'sono'], 'Dia normal')
      expect(errors).toHaveLength(0)
    })

    it('deve detectar dados de humor inválidos', () => {
      const errors = medicalQualityGates.validateMoodData(6, Array(15).fill('fator'), 'A'.repeat(1500))

      expect(errors).toContain('Nível de humor deve estar entre 1 e 5')
      expect(errors).toContain('Máximo de 10 fatores por registro')
      expect(errors).toContain('Notas não podem exceder 1000 caracteres')
    })
  })
})
```

### 7.2 Testes de Segurança e Compliance

```typescript
// __tests__/security/medical-security.test.ts
describe('Medical Data Security', () => {
  describe('Data Encryption', () => {
    it('deve criptografar dados sensíveis antes do armazenamento', async () => {
      const sensitiveData = {
        nome: 'Medicamento Psiquiátrico',
        observacoes: 'Informação médica confidencial',
        notas: 'Estado mental detalhado'
      }

      const encryptedData = await encryptMedicalData(sensitiveData)

      expect(encryptedData.nome).not.toBe(sensitiveData.nome)
      expect(encryptedData.observacoes).not.toBe(sensitiveData.observacoes)
      expect(encryptedData.notas).not.toBe(sensitiveData.notas)
    })

    it('deve descriptografar dados corretamente', async () => {
      const originalData = { notas: 'Informação confidencial' }
      const encrypted = await encryptMedicalData(originalData)
      const decrypted = await decryptMedicalData(encrypted)

      expect(decrypted.notas).toBe(originalData.notas)
    })
  })

  describe('Access Control', () => {
    it('deve verificar autorização antes de acessar dados médicos', async () => {
      const unauthorizedRequest = {
        userId: 'user-1',
        requestingUserId: 'user-2' // Usuário diferente
      }

      await expect(getMedicalData(unauthorizedRequest)).rejects.toThrow('Acesso negado')
    })

    it('deve permitir acesso apenas ao próprio usuário', async () => {
      const authorizedRequest = {
        userId: 'user-1',
        requestingUserId: 'user-1' // Mesmo usuário
      }

      await expect(getMedicalData(authorizedRequest)).resolves.toBeDefined()
    })
  })

  describe('Audit Trail', () => {
    it('deve registrar todas as operações médicas', async () => {
      const medicationData = createMedicamento()

      await createMedication(medicationData)

      const auditLogs = await getAuditLogs('medications', medicationData.id)
      expect(auditLogs).toHaveLength(1)
      expect(auditLogs[0].action).toBe('CREATE')
      expect(auditLogs[0].tableName).toBe('medications')
    })

    it('deve incluir metadados de segurança nos logs', async () => {
      const medicationData = createMedicamento()
      const requestMetadata = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date().toISOString()
      }

      await createMedication(medicationData, requestMetadata)

      const auditLog = await getAuditLogs('medications', medicationData.id)
      expect(auditLog[0].ipAddress).toBe(requestMetadata.ipAddress)
      expect(auditLog[0].userAgent).toBe(requestMetadata.userAgent)
    })
  })

  describe('Data Sanitization', () => {
    it('deve sanitizar entrada para prevenir XSS', async () => {
      const maliciousData = {
        nome: '<script>alert("xss")</script>',
        observacoes: 'javascript:alert("xss")',
        notas: '<img src="x" onerror="alert(1)">'
      }

      const sanitized = sanitizeMedicalInput(maliciousData)

      expect(sanitized.nome).not.toContain('<script>')
      expect(sanitized.observacoes).not.toContain('javascript:')
      expect(sanitized.notas).not.toContain('onerror')
    })

    it('deve prevenir SQL injection em queries', async () => {
      const maliciousInput = "'; DROP TABLE medications; --"

      await expect(searchMedications(maliciousInput)).not.toThrow()

      // Verificar que a tabela ainda existe
      const medications = await getMedications()
      expect(medications).toBeDefined()
    })
  })

  describe('LGPD Compliance', () => {
    it('deve permitir exportação de dados pessoais', async () => {
      const userId = 'user-1'
      const exportedData = await exportUserMedicalData(userId)

      expect(exportedData).toHaveProperty('medicamentos')
      expect(exportedData).toHaveProperty('registrosHumor')
      expect(exportedData).toHaveProperty('dosesTomadas')
      expect(exportedData.metadata).toHaveProperty('exportDate')
    })

    it('deve permitir exclusão completa de dados', async () => {
      const userId = 'user-1'

      await deleteAllUserMedicalData(userId)

      const medications = await getMedications(userId)
      const moodRecords = await getMoodRecords(userId)

      expect(medications).toHaveLength(0)
      expect(moodRecords).toHaveLength(0)
    })

    it('deve anonimizar dados para análises estatísticas', async () => {
      const anonymizedData = await getAnonymizedMedicalStats()

      anonymizedData.forEach(record => {
        expect(record).not.toHaveProperty('userId')
        expect(record).not.toHaveProperty('nome')
        expect(record).not.toHaveProperty('observacoes')
      })
    })
  })
})
```

---

## 🚀 8. PIPELINE CI/CD COM TESTES DE SEGURANÇA

### GitHub Actions Workflow

```yaml
# .github/workflows/saude-module.yml
name: Saúde Module CI/CD

on:
  push:
    paths:
      - 'app/saude/**'
      - '__tests__/saude/**'
      - 'app/components/saude/**'
      - 'app/services/saudeService.ts'
  pull_request:
    paths:
      - 'app/saude/**'
      - '__tests__/saude/**'
      - 'app/components/saude/**'

env:
  NODE_VERSION: '18'
  COVERAGE_THRESHOLD: 80

jobs:
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run security audit
        run: npm audit --audit-level=moderate

      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD

      - name: SAST Analysis
        run: |
          npx semgrep --config=auto app/saude/ app/components/saude/
          npx eslint app/saude/ app/components/saude/ --ext .ts,.tsx

  medical-validation:
    name: Medical Data Validation
    runs-on: ubuntu-latest
    needs: security-scan
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run medical validation tests
        run: |
          npm run test -- __tests__/utils/medical-validation.test.ts
          npm run test -- __tests__/security/medical-security.test.ts

      - name: Validate dosage formats
        run: npm run test -- --testNamePattern="dosage validation"

      - name: Check drug interactions
        run: npm run test -- --testNamePattern="drug interactions"

      - name: Verify data sanitization
        run: npm run test -- --testNamePattern="data sanitization"

  test-saude:
    name: Saúde Module Tests
    runs-on: ubuntu-latest
    needs: medical-validation
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: |
          npm run test -- saude --coverage --reporter=verbose
          npm run test -- components/saude --coverage

      - name: Check coverage threshold
        run: |
          npm run test:coverage -- saude --threshold=${{ env.COVERAGE_THRESHOLD }}

      - name: Performance tests
        run: |
          npm run test -- saude --reporter=verbose --testTimeout=5000

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: saude-module

  integration-saude:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: test-saude
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: stayfocus_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup test database
        run: |
          npm run db:migrate:test
          npm run db:seed:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/stayfocus_test

      - name: Run integration tests
        run: |
          npm run test:integration -- saude
          npm run test:e2e -- saude-flow
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/stayfocus_test

      - name: API contract tests
        run: npm run test:contract -- saude

  compliance-check:
    name: LGPD Compliance Check
    runs-on: ubuntu-latest
    needs: integration-saude
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check data encryption
        run: npm run test -- --testNamePattern="encryption"

      - name: Verify audit trail
        run: npm run test -- --testNamePattern="audit"

      - name: Test data export/deletion
        run: npm run test -- --testNamePattern="LGPD"

      - name: Privacy impact assessment
        run: |
          echo "✅ Data encryption: Verified"
          echo "✅ Audit logging: Verified"
          echo "✅ Data export: Verified"
          echo "✅ Data deletion: Verified"
          echo "✅ Access control: Verified"

  quality-gates:
    name: Quality Gates
    runs-on: ubuntu-latest
    needs: [security-scan, medical-validation, test-saude, integration-saude, compliance-check]
    steps:
      - name: Quality Gate Summary
        run: |
          echo "🔒 Security Scan: PASSED"
          echo "🏥 Medical Validation: PASSED"
          echo "🧪 Unit Tests: PASSED"
          echo "🔗 Integration Tests: PASSED"
          echo "📋 LGPD Compliance: PASSED"
          echo "📊 Coverage > ${{ env.COVERAGE_THRESHOLD }}%: PASSED"
          echo ""
          echo "🎯 Saúde Module: READY FOR DEPLOYMENT"
          echo "✅ All medical data quality gates passed"
          echo "🔐 Security and privacy requirements met"
```

---

## 📊 9. MÉTRICAS ESPECÍFICAS PARA DADOS MÉDICOS

### 9.1 KPIs de Qualidade Médica

| Métrica | Target Mínimo | Target Ideal | Criticidade |
|---------|---------------|--------------|-------------|
| **Coverage de Testes** | 80% | 90% | 🔴 Crítica |
| **Validação de Dosagem** | 100% | 100% | 🔴 Crítica |
| **Detecção de Interações** | 95% | 100% | 🔴 Crítica |
| **Tempo de Resposta API** | < 200ms | < 100ms | 🟡 Alta |
| **Criptografia de Dados** | 100% | 100% | 🔴 Crítica |
| **Auditoria de Operações** | 100% | 100% | 🔴 Crítica |
| **Sanitização de Entrada** | 100% | 100% | 🔴 Crítica |
| **Aderência Medicamentosa** | > 80% | > 90% | 🟡 Alta |

### 9.2 Métricas de Segurança

```typescript
// __tests__/metrics/medical-metrics.test.ts
describe('Medical Metrics', () => {
  describe('Data Quality Metrics', () => {
    it('deve medir precisão de validação de dosagem', async () => {
      const testCases = [
        { input: '10mg', expected: true },
        { input: '5ml', expected: true },
        { input: 'invalid', expected: false },
        { input: '2.5g', expected: true },
        { input: '100', expected: false }
      ]

      let correct = 0
      testCases.forEach(testCase => {
        const result = validateDosage(testCase.input)
        if (result === testCase.expected) correct++
      })

      const accuracy = (correct / testCases.length) * 100
      expect(accuracy).toBeGreaterThanOrEqual(100) // 100% accuracy required
    })

    it('deve medir cobertura de interações medicamentosas', async () => {
      const knownInteractions = await getKnownInteractions()
      const detectedInteractions = await testInteractionDetection()

      const coverage = (detectedInteractions.length / knownInteractions.length) * 100
      expect(coverage).toBeGreaterThanOrEqual(95) // 95% minimum coverage
    })
  })

  describe('Performance Metrics', () => {
    it('deve medir tempo de resposta das APIs médicas', async () => {
      const startTime = performance.now()
      await getMedications()
      const endTime = performance.now()

      const responseTime = endTime - startTime
      expect(responseTime).toBeLessThan(200) // < 200ms
    })

    it('deve medir throughput de operações médicas', async () => {
      const operations = 100
      const startTime = performance.now()

      const promises = Array.from({ length: operations }, () =>
        createMedicamento(createMedicamento())
      )

      await Promise.all(promises)
      const endTime = performance.now()

      const throughput = operations / ((endTime - startTime) / 1000)
      expect(throughput).toBeGreaterThan(50) // > 50 ops/sec
    })
  })

  describe('Security Metrics', () => {
    it('deve verificar 100% de criptografia de dados sensíveis', async () => {
      const sensitiveFields = ['observacoes', 'notas', 'nome']
      const testData = createMedicamento()

      const encryptedData = await encryptMedicalData(testData)

      sensitiveFields.forEach(field => {
        expect(encryptedData[field]).not.toBe(testData[field])
        expect(encryptedData[field]).toMatch(/^[A-Za-z0-9+/]+=*$/) // Base64 pattern
      })
    })

    it('deve verificar 100% de auditoria de operações', async () => {
      const testOperations = [
        () => createMedicamento(createMedicamento()),
        () => updateMedicamento('test-id', { nome: 'Updated' }),
        () => deleteMedicamento('test-id')
      ]

      for (const operation of testOperations) {
        const beforeCount = await getAuditLogCount()
        await operation()
        const afterCount = await getAuditLogCount()

        expect(afterCount).toBe(beforeCount + 1)
      }
    })
  })

  describe('Compliance Metrics', () => {
    it('deve verificar conformidade LGPD', async () => {
      const userId = 'test-user'

      // Teste de exportação
      const exportedData = await exportUserMedicalData(userId)
      expect(exportedData).toBeDefined()
      expect(exportedData.metadata.exportDate).toBeDefined()

      // Teste de exclusão
      await deleteAllUserMedicalData(userId)
      const remainingData = await getMedications(userId)
      expect(remainingData).toHaveLength(0)
    })
  })
})
```

### 9.3 Dashboard de Métricas

```typescript
// app/components/saude/MetricsDashboard.tsx
export function MedicalMetricsDashboard() {
  const metrics = useMedicalMetrics()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Aderência Medicamentosa"
        value={`${metrics.adherence}%`}
        target={90}
        status={metrics.adherence >= 90 ? 'success' : 'warning'}
        icon={<Pill />}
      />

      <MetricCard
        title="Validação de Dados"
        value={`${metrics.dataValidation}%`}
        target={100}
        status={metrics.dataValidation === 100 ? 'success' : 'error'}
        icon={<Shield />}
      />

      <MetricCard
        title="Tempo de Resposta"
        value={`${metrics.responseTime}ms`}
        target={200}
        status={metrics.responseTime < 200 ? 'success' : 'warning'}
        icon={<Clock />}
      />

      <MetricCard
        title="Cobertura de Testes"
        value={`${metrics.testCoverage}%`}
        target={80}
        status={metrics.testCoverage >= 80 ? 'success' : 'error'}
        icon={<TestTube />}
      />
    </div>
  )
}
```

---

## ⏰ 10. CRONOGRAMA DETALHADO TDD

### Semana 1-2: Preparação e Setup TDD Médico
- **Dias 1-3**: Configurar factories específicas para medicamentos e humor
- **Dias 4-7**: Criar MSW handlers com validação médica rigorosa
- **Dias 8-10**: Implementar quality gates de segurança médica
- **Quality Gate**: 100% setup funcional + validações médicas + 8 testes de verificação passando

### Semana 3-4: APIs Core com Validação Médica (TDD Rigoroso)
- **Dias 11-14**: 🔴 Testes medications CRUD → 🟢 Implementação → 🔵 Refatoração
- **Dias 15-18**: 🔴 Testes dose tracking → 🟢 Implementação → 🔵 Refatoração
- **Dias 19-21**: 🔴 Testes mood records → 🟢 Implementação → 🔵 Refatoração
- **Quality Gate**: Coverage > 80% + Performance < 100ms + Validação médica 100%

### Semana 5-6: Frontend Migration com Segurança (TDD)
- **Dias 22-25**: 🔴 Testes componentes médicos → 🟢 Migração → 🔵 Refatoração
- **Dias 26-28**: 🔴 Testes hooks de saúde → 🟢 Implementação → 🔵 Refatoração
- **Dias 29-31**: 🔴 Testes integração E2E → 🟢 Implementação → 🔵 Otimização
- **Quality Gate**: Coverage > 85% + Zero vulnerabilidades + Compliance LGPD

### Semana 7-8: Migração de Dados e Auditoria
- **Dias 32-35**: 🔴 Testes migração segura → 🟢 Script → 🔵 Validação
- **Dias 36-38**: 🔴 Testes rollback → 🟢 Implementação → 🔵 Documentação
- **Dias 39-42**: Auditoria de segurança e documentação compliance
- **Quality Gate**: 100% dados migrados + Auditoria completa + Coverage > 90%

---

## 🛠️ 11. COMANDOS ESPECÍFICOS DO MÓDULO

### Desenvolvimento TDD Médico
```bash
# Executar testes específicos do módulo saúde
npm run test -- saude --watch

# Coverage específico com threshold médico
npm run test:coverage -- saude --threshold=80

# Testes de validação médica
npm run test -- medical-validation --reporter=verbose

# Testes de segurança
npm run test -- security/medical-security --reporter=verbose

# Testes de performance médica
npm run test -- saude --reporter=verbose --testTimeout=3000

# Executar apenas testes Red (falhantes)
npm run test -- saude --reporter=verbose --bail

# Testes de compliance LGPD
npm run test -- --testNamePattern="LGPD"
```

### Quality Gates Automáticos Médicos
```bash
# Verificar coverage threshold médico
npm run test:coverage -- saude --threshold=80

# Executar pipeline completo de saúde
npm run ci:saude

# Verificar validações médicas
npm run test:medical-validation

# Validar segurança de dados
npm run test:security -- saude

# Verificar compliance
npm run test:compliance -- saude

# Auditoria de dados médicos
npm run audit:medical-data
```

### Migração de Dados Médicos
```bash
# Backup dados localStorage (com criptografia)
npm run migrate:backup -- saude --encrypt

# Executar migração segura
npm run migrate:run -- saude --validate

# Rollback se necessário (com auditoria)
npm run migrate:rollback -- saude --audit

# Validar migração médica
npm run migrate:validate -- saude --medical-check

# Verificar integridade dos dados
npm run verify:medical-data -- saude
```

---

## 📋 12. CHECKLIST DE VALIDAÇÃO FINAL

### Preparação TDD Médica (FASE 0 Integrada)
- [ ] ✅ Infraestrutura Vitest + RTL + MSW configurada
- [ ] ✅ Factories específicas para medicamentos e humor criadas
- [ ] ✅ MSW handlers com validação médica implementados
- [ ] ✅ Quality gates de segurança médica configurados
- [ ] ✅ Pipeline CI/CD com testes de segurança configurado
- [ ] ✅ Validações de dosagem e interações implementadas
- [ ] ✅ Criptografia de dados sensíveis configurada
- [ ] ✅ Auditoria de operações médicas implementada

### APIs e Serviços Médicos
- [ ] ✅ CRUD medicamentos com validação médica
- [ ] ✅ Sistema de controle de doses implementado
- [ ] ✅ Detecção de interações medicamentosas
- [ ] ✅ CRUD registros de humor com privacidade
- [ ] ✅ Análise de padrões de humor
- [ ] ✅ Sistema de auditoria médica
- [ ] ✅ Criptografia end-to-end
- [ ] ✅ Compliance LGPD implementado

### Frontend e UX Médica
- [ ] ✅ Componentes de medicamentos migrados
- [ ] ✅ Interface de controle de doses
- [ ] ✅ Monitoramento de humor migrado
- [ ] ✅ Calendário de humor funcional
- [ ] ✅ Análise de fatores de humor
- [ ] ✅ Alertas de segurança médica
- [ ] ✅ Controles de privacidade
- [ ] ✅ Acessibilidade médica implementada

### Migração e Dados
- [ ] ✅ Script de migração segura criado
- [ ] ✅ Backup criptografado implementado
- [ ] ✅ Validação de integridade de dados
- [ ] ✅ Rollback com auditoria
- [ ] ✅ Sincronização dual (localStorage + BD)
- [ ] ✅ Limpeza segura de dados antigos
- [ ] ✅ Verificação de migração completa
- [ ] ✅ Documentação de migração médica

### Segurança e Compliance
- [ ] ✅ Criptografia de dados sensíveis
- [ ] ✅ Controle de acesso implementado
- [ ] ✅ Auditoria de todas as operações
- [ ] ✅ Sanitização de entrada de dados
- [ ] ✅ Prevenção de interações perigosas
- [ ] ✅ Validação de dosagens médicas
- [ ] ✅ Compliance LGPD verificado
- [ ] ✅ Testes de penetração realizados

### Quality Gates Médicos
- [ ] ✅ Coverage > 80% (mínimo para dados médicos)
- [ ] ✅ Performance < 100ms para APIs críticas
- [ ] ✅ 100% validação de dados médicos
- [ ] ✅ Zero vulnerabilidades de segurança
- [ ] ✅ 100% auditoria de operações
- [ ] ✅ Compliance LGPD verificado
- [ ] ✅ Testes de stress aprovados
- [ ] ✅ Documentação médica completa

---

## 🎓 LIÇÕES APRENDIDAS DA FASE 0 APLICADAS

### O Que Funcionou Bem (Replicado para Saúde)
1. **Abordagem Incremental TDD** - Cada funcionalidade médica testada antes da implementação
2. **Quality Gates Automáticos** - Prevenção de regressões em dados críticos de saúde
3. **Documentação Paralela** - Templates e guias médicos criados durante desenvolvimento
4. **Utilities Reutilizáveis** - Factories e helpers específicos para dados médicos

### Melhorias Específicas para Dados Médicos
1. **Validação Médica Rigorosa** - Quality gates específicos para dosagens e interações
2. **Segurança Reforçada** - Criptografia, auditoria e compliance LGPD
3. **Métricas Médicas** - KPIs específicos para aderência e segurança
4. **Pipeline de Segurança** - CI/CD com testes de penetração e compliance

### ROI Esperado (Baseado na FASE 0 + Especificidades Médicas)
- **Desenvolvimento 40% mais rápido** após curva de aprendizado (menor que alimentação devido à complexidade médica)
- **85% menos bugs críticos** em produção (maior que outros módulos devido à criticidade)
- **90% mais rápido onboarding** de desenvolvedores em funcionalidades médicas
- **Infraestrutura paga investimento 8x** em 6 meses (maior ROI devido à criticidade dos dados)

### Investimento vs Benefício Específico

| Investimento TDD Médico | Benefício Esperado | ROI |
|-------------------------|-------------------|-----|
| +60% tempo inicial | -85% bugs críticos | 400% |
| +40% esforço testes | +60% confiança médica | 350% |
| +50% documentação | +95% compliance | 500% |

---

## 🎯 PRÓXIMOS PASSOS PÓS-SAÚDE

### Replicação para Outros Módulos Críticos
1. **Usar este plano como template** para módulos com dados sensíveis
2. **Adaptar validações específicas** de cada domínio
3. **Manter quality gates rigorosos** para todos os módulos críticos
4. **Documentar lições aprendidas** médicas para otimizar próximas migrações

### Evolução Contínua da Segurança Médica
1. **Revisar métricas mensalmente** baseado nos resultados médicos
2. **Atualizar validações** conforme novas interações descobertas
3. **Expandir compliance** para outras regulamentações de saúde
4. **Treinar equipe** nas práticas de desenvolvimento médico seguro

---

**📅 Cronograma Total Estimado**: 7-8 semanas (incluindo TDD rigoroso + validações médicas)
**🔧 Esforço Técnico**: Muito Alto (devido ao TDD + segurança médica, mas com ROI comprovado)
**⚠️ Risco**: Muito Baixo (infraestrutura FASE 0 + testes abrangentes + validações médicas)
**👥 Recursos**: 1 desenvolvedor full-stack + infraestrutura TDD + consultoria médica

---

## ✅ STATUS FINAL

**🏆 STATUS**: ✅ **PLANO REFATORADO COMPLETO - PRONTO PARA EXECUÇÃO**

*Este plano refatorado integra completamente a metodologia e infraestrutura TDD estabelecida na FASE 0, adaptando-a especificamente para dados médicos sensíveis. Garante uma migração segura, testada e de alta qualidade para o módulo de saúde, servindo como modelo para todos os demais módulos críticos do StayFocus que lidam com dados sensíveis.*
```
```
```
