import { environment } from '@raycast/api';
import Database from 'better-sqlite3-multiple-ciphers';
import { sql } from 'drizzle-orm';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { Buffer } from 'node:buffer';
import { createReadStream, createWriteStream, existsSync, mkdirSync, writeFile } from 'node:fs';
import { open } from 'node:fs/promises';
import { arch, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { versions } from 'node:process';
import zlib from 'node:zlib';
import { useEffect, useState } from 'react';
import tar from 'tar-stream';
import packageJson from '../../package.json' with { type: 'json' };
import { schema } from './schema';

export const DRIVER_VERSION = packageJson.dependencies['better-sqlite3-multiple-ciphers'].replace('^', '');
export const DB_NAME = 'ntfy.db';
export const SQLITE_BINDING_NAME = `better_sqlite3-v${DRIVER_VERSION}`;

export const ensureFileExists = async (filename: string) => {
  const filePath = resolve(environment.supportPath, filename);
  const fileHandle = await open(filePath, 'a');
  await fileHandle.close();
};

export const bindingFolder = resolve(environment.assetsPath, `v${versions.modules}`);
export const nativeBinding = resolve(bindingFolder, `${SQLITE_BINDING_NAME}-${arch()}.node`);
console.log('nativeBinding', nativeBinding);
export const dbPath = resolve(environment.supportPath, DB_NAME);

export async function downloadFile(url: string, targetFile: string): Promise<void> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });

  if (!response.ok) {
    console.error('Error downloading file:', response.status, response.statusText);
    throw new Error(response.statusText);
  }

  // Handle redirects
  if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
    return downloadFile(response.headers.get('location')!, targetFile);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const fileStream = createWriteStream(targetFile);
  await response.body.pipeTo(
    new WritableStream({
      write(chunk) {
        fileStream.write(chunk);
      },
      close() {
        fileStream.end();
      },
    }),
  );
}

export async function extractAndRewrite(tarball: string, targetFile: string, dstFile: string): Promise<void> {
  return await new Promise((resolve, reject) => {
    const extract = tar.extract();
    const chunks: Uint8Array[] = [];

    extract.on('entry', function (header, stream, next) {
      if (header.name == targetFile) {
        stream.on('data', function (chunk) {
          chunks.push(chunk);
        });
      }
      stream.on('end', function () {
        next();
      });
      stream.resume();
    });
    extract.on('finish', function () {
      if (chunks.length) {
        const data = Buffer.concat(chunks);
        writeFile(dstFile, data, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      }
    });

    createReadStream(tarball).pipe(zlib.createGunzip()).pipe(extract);
  });
}

let attempts = 3;

export const downloadDependency = async () => {
  const downloadLink =
    `https://github.com/m4heshd/better-sqlite3-multiple-ciphers/releases/download/v${DRIVER_VERSION}/better-sqlite3-multiple-ciphers-v${DRIVER_VERSION}-node-v${versions.modules}-darwin-${arch()}.tar.gz`;

  if (attempts <= 0) throw new Error('Failed to download dependency');
  attempts--;

  try {
    const exists = existsSync(nativeBinding);

    if (exists) {
      return null;
    }

    console.warn("file doesn't exist", nativeBinding);

    if (!existsSync(bindingFolder)) {
      mkdirSync(bindingFolder, { recursive: true });
    }
    const tmpDir = tmpdir();
    const tmpFile = join(tmpDir, 'tmp.tar.gz');
    await downloadFile(downloadLink, tmpFile);
    console.log('downloaded file: ', tmpFile);

    await extractAndRewrite(tmpFile, 'build/Release/better_sqlite3.node', nativeBinding);
    console.log('extracted file: ', nativeBinding);
  } catch (exc) {
    await downloadDependency();
    // TODO: handle error
    if (exc instanceof Error) {
      console.error(exc.name);
      console.error(exc.message);
      console.error(exc.cause);
      console.error(exc.stack);
    } else {
      console.error(exc);
    }
  }
};

let globalDB: BetterSQLite3Database<typeof schema> | null = null;

export const initDB = async () => {
  if (globalDB) return globalDB;

  await downloadDependency();
  await ensureFileExists(dbPath);
  const sqlite = new Database(dbPath, { nativeBinding });
  const db = drizzle(sqlite, { schema });
  globalDB = db;

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server TEXT NOT NULL,
      topic TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
};

export const useDB = () => {
  const [db, setDB] = useState<BetterSQLite3Database<typeof schema> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    initDB().then((db) => {
      setDB(db);
      setIsLoading(false);
    });
  }, []);

  return [db, isLoading] as const;
};
