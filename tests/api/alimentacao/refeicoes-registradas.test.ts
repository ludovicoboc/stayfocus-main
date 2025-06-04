import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const BASE_URL_REFEICOES_REGISTRADAS = 'http://localhost:3000/api/alimentacao/refeicoes-registradas';
const REFEICOES_REGISTRADAS_DB_PATH = path.resolve(process.cwd(), 'db/refeicoes_registradas.json');

type RefeicaoRegistrada = {
  id: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  descricao: string;
  tipoIcone?: string;
  fotoUrl?: string;
};

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const readRegistradasDB = (): RefeicaoRegistrada[] => {
  if (!fs.existsSync(REFEICOES_REGISTRADAS_DB_PATH)) return [];
  const content = fs.readFileSync(REFEICOES_REGISTRADAS_DB_PATH, 'utf-8');
  return content.trim() === '' ? [] : JSON.parse(content);
};

const writeRegistradasDB = (data: RefeicaoRegistrada[]) => {
  fs.writeFileSync(REFEICOES_REGISTRADAS_DB_PATH, JSON.stringify(data, null, 2));
};

const clearRegistradasDB = () => {
  writeRegistradasDB([]);
};

// --- Test Suites ---
describe('Refeições Registradas API (/api/alimentacao/refeicoes-registradas)', () => {
  const originalDbContent = fs.existsSync(REFEICOES_REGISTRADAS_DB_PATH) ? fs.readFileSync(REFEICOES_REGISTRADAS_DB_PATH, 'utf-8') : '[]';

  beforeEach(clearRegistradasDB);

  afterAll(() => {
    fs.writeFileSync(REFEICOES_REGISTRADAS_DB_PATH, originalDbContent);
  });

  describe('POST /', () => {
    it('should create a new meal log with valid data', async () => {
      const newLog = {
        data: getTodayDateString(),
        horario: '13:00',
        descricao: 'Almoço Teste',
        tipoIcone: 'salada',
        fotoUrl: 'http://example.com/foto.jpg'
      };
      const response = await fetch(BASE_URL_REFEICOES_REGISTRADAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.data).toBe(newLog.data);
      expect(data.horario).toBe(newLog.horario);
      expect(data.descricao).toBe(newLog.descricao);
      expect(data.tipoIcone).toBe(newLog.tipoIcone);
      expect(data.fotoUrl).toBe(newLog.fotoUrl);

      const dbState = readRegistradasDB();
      expect(dbState.length).toBe(1);
      expect(dbState[0].descricao).toBe(newLog.descricao);
    });

    it('should return 400 for invalid data format (YYYY-MM-DD)', async () => {
      const newLog = { data: '2023/12/20', horario: '10:00', descricao: 'Formato inválido' };
      const response = await fetch(BASE_URL_REFEICOES_REGISTRADAS, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newLog),
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid horario format (HH:MM)', async () => {
      const newLog = { data: getTodayDateString(), horario: '10h00', descricao: 'Formato inválido' };
      const response = await fetch(BASE_URL_REFEICOES_REGISTRADAS, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newLog),
      });
      expect(response.status).toBe(400);
    });
     it('should return 400 for missing description', async () => {
      const newLog = { data: getTodayDateString(), horario: '10:00' };
      const response = await fetch(BASE_URL_REFEICOES_REGISTRADAS, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newLog),
      });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /', () => {
    it('should return all logs if no date filter', async () => {
      const logs = [
        { id: '1', data: getTodayDateString(), horario: '09:00', descricao: 'Café' },
        { id: '2', data: getYesterdayDateString(), horario: '12:00', descricao: 'Almoço Ontem' },
      ];
      writeRegistradasDB(logs);
      const response = await fetch(BASE_URL_REFEICOES_REGISTRADAS);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.length).toBe(2);
    });

    it('should filter logs by date if ?data=YYYY-MM-DD is provided', async () => {
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();
      const logs = [
        { id: '1', data: today, horario: '09:00', descricao: 'Café Hoje' },
        { id: '2', data: yesterday, horario: '12:00', descricao: 'Almoço Ontem' },
        { id: '3', data: today, horario: '13:00', descricao: 'Almoço Hoje' },
      ];
      writeRegistradasDB(logs);

      const response = await fetch(`${BASE_URL_REFEICOES_REGISTRADAS}?data=${today}`);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.length).toBe(2);
      expect(data.every(log => log.data === today)).toBe(true);
    });

    it('should return 400 if date filter format is invalid', async () => {
      const response = await fetch(`${BASE_URL_REFEICOES_REGISTRADAS}?data=invalid-date`);
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /[id]', () => {
    it('should update an existing log (descricao, tipoIcone, fotoUrl)', async () => {
      const log1 = { id: 'logtest1', data: getTodayDateString(), horario: '10:00', descricao: 'Lanche Inicial', tipoIcone: 'fruta' };
      writeRegistradasDB([log1]);
      const updatedFields = {
        descricao: 'Lanche Atualizado',
        tipoIcone: 'sobremesa',
        fotoUrl: 'http://new.example.com/foto.png'
      };

      const response = await fetch(`${BASE_URL_REFEICOES_REGISTRADAS}/${log1.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(log1.id); // ID and original date/time should not change
      expect(data.data).toBe(log1.data);
      expect(data.horario).toBe(log1.horario);
      expect(data.descricao).toBe(updatedFields.descricao);
      expect(data.tipoIcone).toBe(updatedFields.tipoIcone);
      expect(data.fotoUrl).toBe(updatedFields.fotoUrl);

      const dbState = readRegistradasDB();
      const updatedLogDb = dbState.find(l => l.id === log1.id);
      expect(updatedLogDb.descricao).toBe(updatedFields.descricao);
      expect(updatedLogDb.tipoIcone).toBe(updatedFields.tipoIcone);
      expect(updatedLogDb.fotoUrl).toBe(updatedFields.fotoUrl);
    });

    it('should return 404 if log ID for PUT does not exist', async () => {
      const response = await fetch(`${BASE_URL_REFEICOES_REGISTRADAS}/nonexistent`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: 'Update Fantasma' }),
      });
      expect(response.status).toBe(404);
    });

    it('should return 400 if no valid fields are provided for PUT', async () => {
      const log1 = { id: 'logtest1', data: getTodayDateString(), horario: '10:00', descricao: 'Lanche PUT' };
      writeRegistradasDB([log1]);
      const response = await fetch(`${BASE_URL_REFEICOES_REGISTRADAS}/${log1.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Empty body
      });
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /[id]', () => {
    it('should delete an existing log', async () => {
      const log1 = { id: 'logdel1', data: getTodayDateString(), horario: '15:00', descricao: 'Chá da Tarde' };
      writeRegistradasDB([log1]);

      const response = await fetch(`${BASE_URL_REFEICOES_REGISTRADAS}/${log1.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Meal log deleted successfully.');

      const dbState = readRegistradasDB();
      expect(dbState.length).toBe(0);
    });

    it('should return 404 when trying to delete a non-existent log', async () => {
      const response = await fetch(`${BASE_URL_REFEICOES_REGISTRADAS}/nonexistent`, {
        method: 'DELETE',
      });
      expect(response.status).toBe(404);
    });
  });
});

// Basic expect and test runner structure
if (typeof expect === 'undefined') {
  global.expect = (actual) => ({
    toBe: (expected) => {
      if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
    },
    toBeDefined: () => {
      if (typeof actual === 'undefined') throw new Error(`Expected value to be defined but got undefined`);
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    },
    every: (predicate) => {
        if(!Array.isArray(actual) || !actual.every(predicate)) throw new Error('Predicate failed for one or more elements');
    }
  });
  global.describe = (name, fn) => fn();
  global.it = async (name, fn) => await fn();
  global.beforeEach = (fn) => fn();
  global.afterAll = (fn) => fn();
}
console.log("Test file `tests/api/alimentacao/refeicoes-registradas.test.ts` created.");
