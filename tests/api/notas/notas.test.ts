import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Uses the version from package.json (CommonJS)
// If using ES Modules and 'type: module' in package.json, it would be:
// import fetch from 'node-fetch';
// However, Next.js API routes are typically CommonJS or transpiled.

const BASE_URL = 'http://localhost:3000/api/notas'; // Assuming Next.js dev server runs here
const NOTAS_DB_PATH = path.resolve(process.cwd(), 'db/notas.json');

// Helper to manage db/notas.json for tests
// WARNING: This is a simplified approach. In a real test suite,
// use proper test fixtures and setup/teardown from a test runner.

const getNotesFromFile = (): any[] => {
  if (!fs.existsSync(NOTAS_DB_PATH)) return [];
  const data = fs.readFileSync(NOTAS_DB_PATH, 'utf-8');
  return data ? JSON.parse(data) : [];
};

const saveNotesToFile = (notes: any[]) => {
  fs.writeFileSync(NOTAS_DB_PATH, JSON.stringify(notes, null, 2));
};

const clearNotesDB = () => {
  saveNotesToFile([]);
};

// Backup and restore (very basic for demonstration if no test runner hooks)
let originalNotesBackup: string | null = null;

const backupOriginalNotes = () => {
  if (fs.existsSync(NOTAS_DB_PATH)) {
    originalNotesBackup = fs.readFileSync(NOTAS_DB_PATH, 'utf-8');
  } else {
    originalNotesBackup = '[]'; // If it doesn't exist, assume it was empty
  }
};

const restoreOriginalNotes = () => {
  if (originalNotesBackup !== null) {
    fs.writeFileSync(NOTAS_DB_PATH, originalNotesBackup);
  }
};


// --- Test Suites (using Jest-like syntax for structure) ---

describe('Notas API', () => {
  // It's tricky to manage global setup/teardown without a test runner.
  // For now, we'll assume manual or script-based setup if needed.
  // Ideally:
  // beforeAll(backupOriginalNotes);
  // afterAll(restoreOriginalNotes);
  // beforeEach(clearNotesDB);

  describe('POST /api/notas', () => {
    beforeEach(clearNotesDB); // Clear before each POST test

    it('should create a new note with valid data', async () => {
      const newNoteData = { title: 'Test Note', content: 'This is a test.' };
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNoteData),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.title).toBe(newNoteData.title);
      expect(data.content).toBe(newNoteData.content);
      expect(data.timestamp).toBeDefined();

      const notesInDb = getNotesFromFile();
      expect(notesInDb.length).toBe(1);
      expect(notesInDb[0].title).toBe(newNoteData.title);
    });

    it('should return 400 if title is missing', async () => {
      const newNoteData = { content: 'This is a test without a title.' };
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNoteData),
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 if content is missing', async () => {
      const newNoteData = { title: 'Test Note without content.' };
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNoteData),
      });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/notas', () => {
    beforeEach(clearNotesDB);

    it('should return an empty array if no notes exist', async () => {
      const response = await fetch(BASE_URL);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it('should return all notes', async () => {
      // Add some notes directly to the file for this test
      const sampleNotes = [
        { id: 1, title: 'Note 1', content: 'Content 1', timestamp: Date.now() },
        { id: 2, title: 'Note 2', content: 'Content 2', timestamp: Date.now() + 100 },
      ];
      saveNotesToFile(sampleNotes);

      const response = await fetch(BASE_URL);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);
      // Note: API returns notes sorted by timestamp desc, but file save doesn't guarantee order
      // For more robust check, would compare sets or sort both arrays before comparing.
      // For now, just check length and that IDs are present.
      expect(data.find(n => n.id === 1)).toBeDefined();
      expect(data.find(n => n.id === 2)).toBeDefined();
    });
  });

  describe('GET /api/notas/[id]', () => {
    beforeEach(clearNotesDB);

    it('should return a note if ID exists', async () => {
      const noteId = Date.now();
      const sampleNote = { id: noteId, title: 'Specific Note', content: 'Details', timestamp: noteId };
      saveNotesToFile([sampleNote]);

      const response = await fetch(`${BASE_URL}/${noteId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(sampleNote.id);
      expect(data.title).toBe(sampleNote.title);
    });

    it('should return 404 if ID does not exist', async () => {
      const response = await fetch(`${BASE_URL}/999999`);
      expect(response.status).toBe(404);
    });

     it('should return 400 if ID is not a number (or parsable as one)', async () => {
      const response = await fetch(`${BASE_URL}/abc`);
      // The API parseInts the ID. If it results in NaN, it should be a 400.
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/notas/[id]', () => {
    beforeEach(clearNotesDB);
    let existingNote: any;

    beforeEach(() => { // Using a nested beforeEach for data specific to PUT tests
      const noteId = Date.now();
      existingNote = { id: noteId, title: 'Original Title', content: 'Original Content', timestamp: noteId };
      saveNotesToFile([existingNote]);
    });

    it('should update an existing note with valid data', async () => {
      const updatedData = { title: 'Updated Title', content: 'Updated Content' };
      const response = await fetch(`${BASE_URL}/${existingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(existingNote.id);
      expect(data.title).toBe(updatedData.title);
      expect(data.content).toBe(updatedData.content);
      expect(data.timestamp).not.toBe(existingNote.timestamp); // Timestamp should update

      const notesInDb = getNotesFromFile();
      expect(notesInDb[0].title).toBe(updatedData.title);
    });

    it('should return 404 if trying to update a non-existent note', async () => {
      const updatedData = { title: 'Updated Title', content: 'Updated Content' };
      const response = await fetch(`${BASE_URL}/999999`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      expect(response.status).toBe(404);
    });

    it('should return 400 if title or content is missing for update', async () => {
      // API allows partial updates, but if both are missing, it's a 400
      // The current API implementation for PUT requires at least title OR content.
      // So sending an empty object should be a 400.
      const response = await fetch(`${BASE_URL}/${existingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(400);
    });

     it('should allow partial update (only title)', async () => {
      const updatedData = { title: 'Only Title Updated' };
      const response = await fetch(`${BASE_URL}/${existingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe(updatedData.title);
      expect(data.content).toBe(existingNote.content); // Content should remain the same
    });

    it('should allow partial update (only content)', async () => {
      const updatedData = { content: 'Only Content Updated' };
      const response = await fetch(`${BASE_URL}/${existingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe(existingNote.title); // Title should remain the same
      expect(data.content).toBe(updatedData.content);
    });
  });

  describe('DELETE /api/notas/[id]', () => {
    beforeEach(clearNotesDB);
    let existingNote: any;

    beforeEach(() => { // Data specific to DELETE tests
      const noteId = Date.now();
      existingNote = { id: noteId, title: 'To Be Deleted', content: 'Delete me', timestamp: noteId };
      saveNotesToFile([existingNote, { id: noteId + 1, title: 'Another Note', content: 'Keep me', timestamp: noteId + 1 }]);
    });

    it('should delete an existing note', async () => {
      const response = await fetch(`${BASE_URL}/${existingNote.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Note deleted successfully.');

      const notesInDb = getNotesFromFile();
      expect(notesInDb.length).toBe(1);
      expect(notesInDb.find(n => n.id === existingNote.id)).toBeUndefined();
    });

    it('should return 404 when trying to fetch a deleted note', async () => {
      // First, delete the note
      await fetch(`${BASE_URL}/${existingNote.id}`, { method: 'DELETE' });

      // Then, try to fetch it
      const response = await fetch(`${BASE_URL}/${existingNote.id}`);
      expect(response.status).toBe(404);
    });

    it('should return 404 if trying to delete a non-existent note', async () => {
      const response = await fetch(`${BASE_URL}/999999`, {
        method: 'DELETE',
      });
      expect(response.status).toBe(404);
    });
  });
});

// Dummy expect implementation if no test runner like Jest is present
// This is very basic and only for structural purposes.
// A real test suite would use Jest/Mocha/etc.
if (typeof expect === 'undefined') {
  global.expect = (actual: any) => ({
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Assertion failed: expected ${expected}, but got ${actual}`);
      }
      console.log(`✓ Passed: ${actual} === ${expected}`);
    },
    toBeDefined: () => {
      if (typeof actual === 'undefined') {
        throw new Error(`Assertion failed: expected value to be defined, but it was undefined.`);
      }
      console.log(`✓ Passed: ${actual} is defined`);
    },
    // Add other common matchers as needed for the tests above
    // This is not a complete 'expect' implementation.
    not: {
        toBe: (expected: any) => {
             if (actual === expected) {
                throw new Error(`Assertion failed: expected NOT ${expected}, but got ${actual}`);
            }
            console.log(`✓ Passed: ${actual} !== ${expected}`);
        }
    }
  });

  // Dummy describe, it, beforeAll, afterAll, beforeEach, afterEach
  global.describe = (name: string, fn: () => void) => {
    console.log(`\nDESCRIBE: ${name}`);
    fn();
  };
  global.it = async (name: string, fn: () => Promise<void> | void) => {
    try {
      console.log(`  IT: ${name}`);
      await fn();
    } catch (e: any) {
      console.error(`  ✗ FAILED: ${name} - ${e.message}`);
    }
  };
  global.beforeAll = (fn: () => void) => { console.log("HOOK: beforeAll"); fn(); };
  global.afterAll = (fn: () => void) => { console.log("HOOK: afterAll"); fn(); };
  global.beforeEach = (fn: () => void) => { console.log("HOOK: beforeEach"); fn(); };
  global.afterEach = (fn: () => void) => { console.log("HOOK: afterEach"); fn(); };
}

// Example of how one might try to run this if not using a test runner:
// (async () => {
//   try {
//     backupOriginalNotes(); // Manual call
//     // Manually call describe blocks or specific tests if needed
//     // This is not how tests are typically run.
//     // The content of the describe blocks would need to be invoked.
//     // For now, this file just defines the tests.
//     console.log("Test definitions loaded. Run with a test runner like Jest.");
//   } finally {
//     restoreOriginalNotes(); // Manual call
//   }
// })();

// To make this file runnable for simple execution:
// Manually trigger the describe blocks or a selection of tests.
// This is NOT a substitute for a real test runner.
// const runTests = async () => {
//   backupOriginalNotes();
//   try {
//     // --- Simulating test execution ---
//     // This is a highly simplified way to "run" the tests defined above
//     // without a proper test runner environment.
//     console.log("Starting manual test execution simulation...");

//     // For POST tests
//     clearNotesDB();
//     await global.it('should create a new note with valid data', async () => { /* ... copy test logic here or refactor ... */ });
//     clearNotesDB();
//     await global.it('should return 400 if title is missing', async () => { /* ... */ });
//     // ... and so on for all tests. This is very verbose and error-prone.

//     // The best approach is to rely on a test runner to discover and run these.
//     // The structure above is Jest-compatible.

//   } catch (error) {
//     console.error("Error during manual test run:", error);
//   } finally {
//     restoreOriginalNotes();
//     console.log("Manual test execution simulation finished.");
//   }
// };

// if (require.main === module) {
//   console.log("Attempting to run tests (simulated)...");
//   // runTests(); // Uncomment to try running (requires filling out the stubs)
//   console.log("Test file created. Please use a test runner (e.g., Jest) to execute these tests against a running dev server.");
// }
// The file is primarily for defining tests for a runner.
// The dummy expect and runner functions are for basic validation if run directly,
// but not for actual test execution.
console.log("Test file `tests/api/notas/notas.test.ts` created. It is structured for Jest/similar test runners.");
console.log("Basic file I/O helpers for db/notas.json are included.");
console.log("Dummy 'expect' and test runner functions are for illustrative purposes if no runner is available immediately.");
console.log("Actual execution requires a test runner and a running Next.js dev server.");

// Note: The `beforeEach` calls inside `describe` blocks won't run automatically
// without a test runner. The helper functions `clearNotesDB`, `saveNotesToFile` etc.
// are available for manual setup if running parts of this script directly, but that's not the primary intent.
