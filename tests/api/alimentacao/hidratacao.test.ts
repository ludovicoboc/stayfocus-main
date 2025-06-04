import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const BASE_URL_HIDRATACAO = 'http://localhost:3000/api/alimentacao/hidratacao';
const HIDRATACAO_DB_PATH = path.resolve(process.cwd(), 'db/hidratacao.json');

type HidratacaoData = {
  metaDiaria: number;
  ultimoReset: string; // YYYY-MM-DD
  registrosHoje: Array<{ id: number; hora: string }>;
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

const readHidratacaoDB = (): HidratacaoData => {
  if (!fs.existsSync(HIDRATACAO_DB_PATH)) {
    throw new Error('hidratacao.json not found for tests!');
  }
  return JSON.parse(fs.readFileSync(HIDRATACAO_DB_PATH, 'utf-8'));
};

const writeHidratacaoDB = (data: HidratacaoData) => {
  fs.writeFileSync(HIDRATACAO_DB_PATH, JSON.stringify(data, null, 2));
};

const resetHidratacaoDB = (initialData?: Partial<HidratacaoData>) => {
  const defaults: HidratacaoData = {
    metaDiaria: 8,
    ultimoReset: getTodayDateString(),
    registrosHoje: [],
  };
  writeHidratacaoDB({ ...defaults, ...initialData });
};

// --- Test Suites ---
describe('Hidratação API (/api/alimentacao/hidratacao)', () => {
  const originalDbContent = fs.existsSync(HIDRATACAO_DB_PATH) ? fs.readFileSync(HIDRATACAO_DB_PATH, 'utf-8') : null;

  afterAll(() => {
    if (originalDbContent !== null) {
      fs.writeFileSync(HIDRATACAO_DB_PATH, originalDbContent);
    } else {
      // If it didn't exist, maybe remove it, or ensure it's in a default state
      // For now, leave it as potentially created by tests if it wasn't there.
    }
  });

  describe('GET /', () => {
    beforeEach(resetHidratacaoDB);

    it('should return initial state correctly', async () => {
      resetHidratacaoDB({ metaDiaria: 10, ultimoReset: getTodayDateString(), registrosHoje: [] });
      const response = await fetch(BASE_URL_HIDRATACAO);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metaDiaria).toBe(10);
      expect(data.coposBebidosHoje).toBe(0);
      expect(data.ultimoReset).toBe(getTodayDateString());
    });

    it('should perform daily reset if ultimoReset is a past date', async () => {
      resetHidratacaoDB({
        ultimoReset: getYesterdayDateString(),
        registrosHoje: [{ id: 1, hora: '10:00' }],
        metaDiaria: 5,
      });

      const response = await fetch(BASE_URL_HIDRATACAO);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metaDiaria).toBe(5);
      expect(data.coposBebidosHoje).toBe(0); // Reset
      expect(data.ultimoReset).toBe(getTodayDateString()); // Updated

      const dbState = readHidratacaoDB();
      expect(dbState.registrosHoje.length).toBe(0);
      expect(dbState.ultimoReset).toBe(getTodayDateString());
    });
  });

  describe('PUT /', () => {
    beforeEach(resetHidratacaoDB);

    it('should update metaDiaria', async () => {
      const newMeta = 12;
      const response = await fetch(BASE_URL_HIDRATACAO, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metaDiaria: newMeta }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metaDiaria).toBe(newMeta);

      const dbState = readHidratacaoDB();
      expect(dbState.metaDiaria).toBe(newMeta);
    });

    it('should return 400 for invalid metaDiaria (non-numeric)', async () => {
      const response = await fetch(BASE_URL_HIDRATACAO, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metaDiaria: 'abc' }),
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid metaDiaria (zero or negative)', async () => {
      const response = await fetch(BASE_URL_HIDRATACAO, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metaDiaria: 0 }),
      });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /copo', () => {
    beforeEach(resetHidratacaoDB);

    it('should add a cup and increment count', async () => {
      const response = await fetch(`${BASE_URL_HIDRATACAO}/copo`, { method: 'POST' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.coposBebidosHoje).toBe(1);
      expect(data.registrosHoje.length).toBe(1);
      expect(data.registrosHoje[0].id).toBeDefined();
      expect(data.registrosHoje[0].hora).toBeDefined();

      const dbState = readHidratacaoDB();
      expect(dbState.registrosHoje.length).toBe(1);
    });

    it('should perform daily reset if adding a cup on a new day', async () => {
      resetHidratacaoDB({ ultimoReset: getYesterdayDateString(), registrosHoje: [{id: 1, hora: "10:00"}] });

      const response = await fetch(`${BASE_URL_HIDRATACAO}/copo`, { method: 'POST' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.coposBebidosHoje).toBe(1); // Reset, then added 1
      expect(data.registrosHoje.length).toBe(1);
      expect(data.ultimoReset).toBe(getTodayDateString());

      const dbState = readHidratacaoDB();
      expect(dbState.registrosHoje.length).toBe(1); // After reset, one cup added
      expect(dbState.ultimoReset).toBe(getTodayDateString());
    });
  });

  describe('DELETE /copo', () => {
    beforeEach(resetHidratacaoDB);

    it('should remove a cup if one exists', async () => {
      // Add a cup first
      await fetch(`${BASE_URL_HIDRATACAO}/copo`, { method: 'POST' });
      await fetch(`${BASE_URL_HIDRATACAO}/copo`, { method: 'POST' }); // Add second cup

      const response = await fetch(`${BASE_URL_HIDRATACAO}/copo`, { method: 'DELETE' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.coposBebidosHoje).toBe(1);
      expect(data.registrosHoje.length).toBe(1);

      const dbState = readHidratacaoDB();
      expect(dbState.registrosHoje.length).toBe(1);
    });

    it('should do nothing if no cups to remove (but return current state)', async () => {
      const response = await fetch(`${BASE_URL_HIDRATACAO}/copo`, { method: 'DELETE' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.coposBebidosHoje).toBe(0);
      expect(data.registrosHoje.length).toBe(0);
    });

    it('should perform daily reset if removing a cup on a new day', async () => {
      resetHidratacaoDB({
        ultimoReset: getYesterdayDateString(),
        registrosHoje: [{id: 1, hora: "10:00"}, {id: 2, hora: "11:00"}]
      });

      const response = await fetch(`${BASE_URL_HIDRATACAO}/copo`, { method: 'DELETE' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.coposBebidosHoje).toBe(0); // Reset, so 0 cups
      expect(data.registrosHoje.length).toBe(0);
      expect(data.ultimoReset).toBe(getTodayDateString());

      const dbState = readHidratacaoDB();
      expect(dbState.registrosHoje.length).toBe(0); // After reset, no cups
      expect(dbState.ultimoReset).toBe(getTodayDateString());
    });
  });
});

// Basic expect and test runner structure (for environments without Jest/Mocha)
if (typeof expect === 'undefined') {
  global.expect = (actual) => ({
    toBe: (expected) => {
      if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
    },
    toBeDefined: () => {
      if (typeof actual === 'undefined') throw new Error(`Expected value to be defined but got undefined`);
    },
    toEqual: (expected) => { // Simple deep equal for arrays/objects if needed
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    },
    // Add more matchers as needed by tests
  });
  global.describe = (name, fn) => fn();
  global.it = async (name, fn) => await fn();
  global.beforeEach = (fn) => fn();
  global.afterAll = (fn) => fn(); // Simplified
}
console.log("Test file `tests/api/alimentacao/hidratacao.test.ts` created.");
