import { arch } from 'node:os';

export const DB_NAME = 'ntfy.db';
export const DRIVER_PATH = `deps/better-sqlite3/better_sqlite3-${arch()}.node`;
export const MIGRATIONS_FOLDER = 'drizzle';
