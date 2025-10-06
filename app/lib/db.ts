import Database from 'better-sqlite3';
import path from 'path';

// Previne a criação de novas instâncias do banco de dados em hot-reload do Next.js
// Em desenvolvimento, o 'global' é preservado entre as recargas, o que nos permite manter a conexão.
declare const global: typeof globalThis & {
  db: Database.Database | undefined;
};

const dbPath = path.resolve(process.cwd(), 'database.db');
let db: Database.Database;

if (process.env.NODE_ENV === 'production') {
  // Em produção, crie uma nova instância.
  db = new Database(dbPath);
} else {
  // Em desenvolvimento, use a instância global se ela existir, senão crie uma nova.
  if (!global.db) {
    global.db = new Database(dbPath, { verbose: console.log });
  }
  db = global.db;
}

export default db;