import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
let database: Promise<SQLiteDatabase> | undefined;
function getDatabase() {
  if (!database) {
    database = (async () => {
      const db = await openDatabaseAsync('que-cocino.db');
      await db.execAsync('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);');
      return db;
    })().catch(error => { database = undefined; throw error; });
  }
  return database;
}
export async function loadKitchen(): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', 'kitchen-v1');
  return row?.value ?? null;
}
export async function readRecord(key: string): Promise<string | null> {
  const db = await getDatabase();
  return (await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key))?.value ?? null;
}
export async function writeRecord(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, value);
}
export async function removeRecord(key: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM settings WHERE key = ?', key);
}
export async function saveKitchen(value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', 'kitchen-v1', value);
}

// Separate versioned record; kitchen-v1 and its existing data are unchanged.
export async function loadPreferences(): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', 'preferences-v1');
  return row?.value ?? null;
}
export async function savePreferences(value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', 'preferences-v1', value);
}
