import * as SQLite from 'expo-sqlite';

import type { Empresa, VendasDia } from '@/api/schemas';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('arara_mobile.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS empresas_cache (
          id TEXT PRIMARY KEY NOT NULL,
          nome TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS vendas_dia_cache (
          empresa_id TEXT NOT NULL,
          data TEXT NOT NULL,
          quantidade INTEGER NOT NULL,
          total REAL NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (empresa_id, data)
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

export async function cacheEmpresas(empresas: Empresa[]): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM empresas_cache');
    for (const empresa of empresas) {
      await db.runAsync(
        'INSERT INTO empresas_cache (id, nome, updated_at) VALUES (?, ?, ?)',
        empresa.id,
        empresa.nome,
        now,
      );
    }
  });
}

export async function readCachedEmpresas(): Promise<Empresa[]> {
  const db = await getDb();
  return db.getAllAsync<Empresa>('SELECT id, nome FROM empresas_cache ORDER BY nome COLLATE NOCASE');
}

export async function cacheVendasDia(vendas: VendasDia): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO vendas_dia_cache (empresa_id, data, quantidade, total, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    vendas.empresaId,
    vendas.data,
    vendas.quantidade,
    vendas.total,
    now,
  );
}

export async function readCachedVendasDia(
  empresaId: string,
  data?: string,
): Promise<VendasDia | null> {
  const db = await getDb();
  if (data) {
    return (
      (await db.getFirstAsync<VendasDia>(
        `SELECT empresa_id as empresaId, data, quantidade, total
         FROM vendas_dia_cache WHERE empresa_id = ? AND data = ?`,
        empresaId,
        data,
      )) ?? null
    );
  }
  return (
    (await db.getFirstAsync<VendasDia>(
      `SELECT empresa_id as empresaId, data, quantidade, total
       FROM vendas_dia_cache WHERE empresa_id = ?
       ORDER BY data DESC LIMIT 1`,
      empresaId,
    )) ?? null
  );
}
