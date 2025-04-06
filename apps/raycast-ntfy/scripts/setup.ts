#!/usr/bin/env node
import { createReadStream, createWriteStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path, { join, resolve } from 'node:path';
import zlib from 'node:zlib';
import { versions } from 'process';
import tar from 'tar-stream';

const DEPS_FOLDER = resolve('./assets/deps');
const DRIVER_VERSION = '11.9.1';
const BETTER_SQLITE3_FILE_PREFIX = `better-sqlite3-multiple-ciphers-v${DRIVER_VERSION}-node-v${versions.modules}-darwin`;
const BETTER_SQLITE3_RELEASES_URL = `https://github.com/m4heshd/better-sqlite3-multiple-ciphers/releases/download/v${DRIVER_VERSION}`;

const dependencies: Dependency[] = [
  {
    url: `${BETTER_SQLITE3_RELEASES_URL}/${BETTER_SQLITE3_FILE_PREFIX}-x64.tar.gz`,
    files: [{ from: 'better_sqlite3.node', to: 'better_sqlite3-x64.node' }],
    destFolder: `${DEPS_FOLDER}/better-sqlite3`,
  },
  {
    url: `${BETTER_SQLITE3_RELEASES_URL}/${BETTER_SQLITE3_FILE_PREFIX}-arm64.tar.gz`,
    files: [{ from: 'better_sqlite3.node', to: 'better_sqlite3-arm64.node' }],
    destFolder: `${DEPS_FOLDER}/better-sqlite3`,
  },
];
export const downloadFileAndExtract = async (dep: Dependency) => {
  const urlFileName = dep.url.split('/').pop() ?? 'file.tar.gz';
  const tmpDir = tmpdir();
  const filePath = path.join(tmpDir, urlFileName);

  const response = await fetch(dep.url);
  const buffer = await response.arrayBuffer();
  writeFileSync(filePath, Buffer.from(buffer));

  return extractTarGz(filePath, dep);
};

export const extractTarGz = async (tarFile: string, dep: Dependency) =>
  new Promise<void>((resolve, reject) => {
    const extract = tar.extract();
    const readStream = createReadStream(tarFile);

    if (!existsSync(dep.destFolder)) mkdirSync(dep.destFolder, { recursive: true });

    extract.on('entry', (header, stream, next) => {
      if (header.type !== 'file') return next();

      const sourceFile = dep.files.find((dep) => header.name.endsWith(dep.from))?.to;
      if (!sourceFile) return next();

      const destPath = join(dep.destFolder, sourceFile);
      if (existsSync(destPath)) return next();

      console.info('Extracting', destPath);
      const writeStream = createWriteStream(destPath);
      stream.pipe(writeStream).on('finish', resolve).on('error', reject);
      next();
    });

    extract.on('finish', resolve);
    extract.on('error', reject);

    readStream.pipe(zlib.createGunzip()).pipe(extract).on('finish', resolve).on('error', reject);
  });

export const setup = async () => await Promise.all(dependencies.map(downloadFileAndExtract));

setup();
