import { Statement, type Database } from 'better-sqlite3';
import SQLiteDB from 'better-sqlite3-multiple-ciphers';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { existsSync } from 'node:fs';
import { mkdir, open } from 'node:fs/promises';
import { hostname } from 'node:os';
import { dirname, resolve } from 'node:path';
import { DB_NAME, DRIVER_PATH, MIGRATIONS_FOLDER } from '../lib/constants';
import { seed } from '../scripts/seed';
import { schema, type Schema } from './schema';

const isDevelopment = process.env.NODE_ENV !== 'production';

const getOptions = async () => {
  if (!!process.env.RAYCAST_VERSION) {
    const { environment, getPreferenceValues, openExtensionPreferences } = await import('@raycast/api');
    const preferences = getPreferenceValues<Preferences>();

    if (!preferences.encryptedKey) {
      await openExtensionPreferences();
      throw new Error('No encryption key provided');
    }

    const assetsPath = environment.assetsPath;
    const dbPath = resolve(environment.supportPath, DB_NAME);
    const isNewDB = !existsSync(dbPath);
    return {
      isRaycast: true,
      isDevelopment: environment.isDevelopment,
      assetsPath,
      dbPath,
      isNewDB,
      nativeBinding: resolve(assetsPath, DRIVER_PATH),
      preferences,
    };
  } else {
    console.log(process.cwd(), require.main?.path);
    const assetsPath = resolve(__dirname, '../../assets');
    const dbPath = resolve(__dirname, '../../ntfy.db');
    const isNewDB = !existsSync(dbPath);
    return {
      isRaycast: false,
      isDevelopment: true,
      assetsPath,
      dbPath,
      isNewDB,
      nativeBinding: resolve(assetsPath, DRIVER_PATH),
      preferences: {
        encryptedKey: '',
        defaultServer: 'https://ntfy.sh/',
        defaultTopic: hostname(),
      } as Preferences,
    };
  }
};

export type DrizzleDB = BetterSQLite3Database<Schema> & {
  $client: Database;
};

export type NtfyDB = DrizzleDB & {
  enableDebug: () => void;
  disableDebug: () => void;
  performDBMaintenance: () => void;
  disconnect: () => void;
};

let DB_STATE: 'idle' | 'loading' | 'ready' = 'idle';
let DB: NtfyDB | null = null;

export const migrateDB = async (db: NtfyDB) => {
  const { assetsPath } = await getOptions();
  if (!existsSync(resolve(assetsPath, MIGRATIONS_FOLDER, 'meta', '_journal.json'))) return;
  await migrate(db, { migrationsFolder: resolve(assetsPath, MIGRATIONS_FOLDER) });
};

const defaultPragmas = [
  'journal_mode = WAL',
  'foreign_keys = ON',
  'temp_store = MEMORY',
  'mmap_size = 33554432', // 32MB
  'busy_timeout = 5000',
  'secure_delete = TRUE',
];

const productionPragmas = [
  'synchronous = NORMAL',
  'auto_vacuum = INCREMENTAL',
  'cache_size = -64000', // 64MB
  'profile = OFF',
  'strict = OFF',
  'query_plan = OFF',
  'vdbe_trace = OFF',
  'vdbe_listing = OFF',
  'sql_trace = OFF',
  'stats = OFF',
  'debug = OFF',
];

const developmentPragmas = [
  'synchronous = OFF',
  'auto_vacuum = NONE',
  'cache_size = -250000', // 250MB
  'profile = ON',
  'strict = ON',
];

export async function initDB() {
  if (DB_STATE === 'ready' && DB) return DB;
  DB_STATE = 'loading';

  const { dbPath, nativeBinding, isDevelopment, isRaycast, isNewDB, preferences } = await getOptions();

  if (isNewDB) {
    const dir = dirname(dbPath);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    const f = await open(dbPath, 'w+');
    await f.close();
  }

  console.log('dbPath', dbPath);
  const sqlite = new SQLiteDB(dbPath, { nativeBinding });
  const db = drizzle(sqlite, { schema });

  defaultPragmas.forEach((pragma) => {
    db.$client.pragma(pragma);
  });

  if (!isDevelopment) {
    productionPragmas.forEach((pragma) => db.$client.pragma(pragma));
    db.$client.pragma(`key='${preferences.encryptedKey}'`);
  } else {
    developmentPragmas.forEach((pragma) => db.$client.pragma(pragma));

    const originalPrepare = db.$client.prepare;
    db.$client.prepare = function <T extends unknown[] | {} = unknown[], R = unknown>(this: Database, sql: string) {
      try {
        const stmt = originalPrepare.call(this, sql);
        (stmt as any).explain = function explain() {
          console.debug('💬', sql);
          const plan = db.$client
            .prepare(`EXPLAIN QUERY PLAN ${sql}`)
            .all()
            .map((item: unknown) => (item as { detail: string }).detail);
          console.debug('💭', plan);
          return stmt;
        };
        return stmt as Statement<T, R>;
      } catch (error) {
        console.debug('📜', sql);
        throw error;
      }
    };
  }

  DB = db as NtfyDB;
  DB.enableDebug = () => enableDebug(db);
  DB.disableDebug = () => disableDebug(db);
  DB.performDBMaintenance = () => performDBMaintenance(db);
  DB.disconnect = () => disconnectDB(db);

  console.log('isDevelopment', isDevelopment, isNewDB);
  if (isRaycast) await migrateDB(DB);
  if (isNewDB) await seed(DB);

  DB_STATE = 'ready';

  return DB;
}

export function performDBMaintenance(db: DrizzleDB) {
  try {
    db.$client.pragma('quick_check');
    db.$client.pragma(`foreign_key_check`);
    db.$client.pragma(`optimize`);
    db.$client.pragma(`incremental_vacuum(${isDevelopment ? 0 : 1000})`);
    db.$client.pragma('wal_checkpoint(TRUNCATE)');
  } catch (error) {
    console.error('Maintenance Error:', error);
  }
}

export function enableDebug(db: DrizzleDB) {
  try {
    db.$client.pragma(`debug = on`);
    db.$client.pragma(`stats = ON`);
    db.$client.pragma(`query_plan = ON`);
    db.$client.pragma(`sql_trace = ON`);
    db.$client.pragma(`vdbe_trace = ON`);
    db.$client.pragma(`vdbe_listing = ON`);
  } catch (error) {
    console.error('Debug Error:', error);
  }
}

export function disableDebug(db: DrizzleDB) {
  try {
    db.$client.pragma(`debug = OFF`);
    db.$client.pragma(`stats = OFF`);
    db.$client.pragma(`query_plan = OFF`);
    db.$client.pragma(`sql_trace = OFF`);
    db.$client.pragma(`vdbe_trace = OFF`);
    db.$client.pragma(`vdbe_listing = OFF`);
  } catch (error) {
    console.error('Debug Error:', error);
  }
}

export function disconnectDB(db: DrizzleDB) {
  if (DB_STATE !== 'ready') return;
  try {
    db.$client.pragma('wal_checkpoint(FULL)');
    db.$client.pragma('optimize');
    db.$client.pragma('incremental_vacuum');
    db.$client.close();
  } catch (error) {
    console.error('Disconnect Error:', error);
  }
  DB_STATE = 'idle';
  DB = null;
}

export const db$ = new Promise<NtfyDB>((res, rej) => initDB().then(res).catch(rej));
