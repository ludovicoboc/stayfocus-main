import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const BASE_URL_REFEICOES_PLANEJADAS = 'http://localhost:3000/api/alimentacao/refeicoes-planejadas';
const REFEICOES_PLANEJADAS_DB_PATH = path.resolve(process.cwd(), 'db/refeicoes_planejadas.json');

type RefeicaoPlanejada = {
  id: string;
  horario: string; // HH:MM
  descricao: string;
};

const readRefeicoesPlanejadasDB = (): RefeicaoPlanejada[] => {
  if (!fs.existsSync(REFEICOES_PLANEJADAS_DB_PATH)) {
    return []; // As per API logic, if file doesn't exist, it's an empty list
  }
  const content = fs.readFileSync(REFEICOES_PLANEJADAS_DB_PATH, 'utf-8');
  return content.trim() === '' ? [] : JSON.parse(content);
};

const writeRefeicoesPlanejadasDB = (data: RefeicaoPlanejada[]) => {
  fs.writeFileSync(REFEICOES_PLANEJADAS_DB_PATH, JSON.stringify(data, null, 2));
};

const clearRefeicoesPlanejadasDB = () => {
  writeRefeicoesPlanejadasDB([]);
};

// --- Test Suites ---
describe('Refeições Planejadas API (/api/alimentacao/refeicoes-planejadas)', () => {
  const originalDbContent = fs.existsSync(REFEICOES_PLANEJADAS_DB_PATH) ? fs.readFileSync(REFEICOES_PLANEJADAS_DB_PATH, 'utf-8') : '[]';

  beforeEach(clearRefeicoesPlanejadasDB);

  afterAll(() => {
    fs.writeFileSync(REFEICOES_PLANEJADAS_DB_PATH, originalDbContent);
  });

  describe('POST /', () => {
    it('should create a new planned meal with valid data', async () => {
      const newMeal = { horario: '08:00', descricao: 'Café da Manhã' };
      const response = await fetch(BASE_URL_REFEICOES_PLANEJADAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeal),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.horario).toBe(newMeal.horario);
      expect(data.descricao).toBe(newMeal.descricao);

      const dbState = readRefeicoesPlanejadasDB();
      expect(dbState.length).toBe(1);
      expect(dbState[0].descricao).toBe(newMeal.descricao);
    });

    it('should return 400 for missing horario', async () => {
      const newMeal = { descricao: 'Sem horário' };
      const response = await fetch(BASE_URL_REFEICOES_PLANEJADAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeal),
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid horario format', async () => {
      const newMeal = { horario: '8:00', descricao: 'Horário inválido' };
      const response = await fetch(BASE_URL_REFEICOES_PLANEJADAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeal),
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 for missing descricao', async () => {
      const newMeal = { horario: '09:00' };
      const response = await fetch(BASE_URL_REFEICOES_PLANEJADAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeal),
      });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /', () => {
    it('should return an empty array if no meals exist', async () => {
      const response = await fetch(BASE_URL_REFEICOES_PLANEJADAS);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return all planned meals', async () => {
      const meals = [
        { id: '1', horario: '08:00', descricao: 'Café' },
        { id: '2', horario: '12:00', descricao: 'Almoço' },
      ];
      writeRefeicoesPlanejadasDB(meals);
      const response = await fetch(BASE_URL_REFEICOES_PLANEJADAS);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.length).toBe(2);
    });
  });

  describe('PUT /[id]', () => {
    it('should update an existing meal', async () => {
      const meal1 = { id: 'test1', horario: '10:00', descricao: 'Lanche' };
      writeRefeicoesPlanejadasDB([meal1]);
      const updatedData = { horario: '10:30', descricao: 'Lanche Atualizado' };

      const response = await fetch(`${BASE_URL_REFEICOES_PLANEJADAS}/${meal1.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.horario).toBe(updatedData.horario);
      expect(data.descricao).toBe(updatedData.descricao);

      const dbState = readRefeicoesPlanejadasDB();
      expect(dbState[0].descricao).toBe(updatedData.descricao);
    });

    it('should return 404 for non-existent meal ID', async () => {
      const updatedData = { horario: '10:30', descricao: 'Lanche Fantasma' };
      const response = await fetch(`${BASE_URL_REFEICOES_PLANEJADAS}/nonexistentid`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data on update', async () => {
       const meal1 = { id: 'test1', horario: '10:00', descricao: 'Lanche' };
       writeRefeicoesPlanejadasDB([meal1]);
       const invalidData = { horario: 'invalidtime' };
       const response = await fetch(`${BASE_URL_REFEICOES_PLANEJADAS}/${meal1.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });
      expect(response.status).toBe(400); // API expects full valid object, or specific field errors
    });
  });

  describe('DELETE /[id]', () => {
    it('should delete an existing meal', async () => {
      const meal1 = { id: 'testdel1', horario: '14:00', descricao: 'Chá' };
      writeRefeicoesPlanejadasDB([meal1]);

      const response = await fetch(`${BASE_URL_REFEICOES_PLANEJADAS}/${meal1.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Planned meal deleted successfully.');

      const dbState = readRefeicoesPlanejadasDB();
      expect(dbState.length).toBe(0);
    });

    it('should return 404 when trying to delete a non-existent meal', async () => {
      const response = await fetch(`${BASE_URL_REFEICOES_PLANEJADAS}/nonexistentid`, {
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
  });
  global.describe = (name, fn) => fn();
  global.it = async (name, fn) => await fn();
  global.beforeEach = (fn) => fn();
  global.afterAll = (fn) => fn();
}
console.log("Test file `tests/api/alimentacao/refeicoes-planejadas.test.ts` created.");
