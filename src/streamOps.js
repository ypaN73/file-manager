import { createReadStream, createWriteStream } from 'fs';
import { resolve, basename } from 'path';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';
import { createHash } from 'crypto';
import { pipeline } from 'stream/promises';
import { stat, access, constants } from 'fs/promises';
import { InputError, OperationError } from './operations.js';

const checkArgs = (args, needed, cmd) => {
  if (args.length !== needed) {
    throw new InputError(`${cmd} needs ${needed} arguments`);
  }
};

const checkIsFile = async (path) => {
  const info = await stat(path);
  if (!info.isFile()) {
    throw new OperationError('Not a file');
  }
};

const checkDirExists = async (path) => {
  try {
    await access(path, constants.F_OK);
  } catch {
    throw new OperationError('Directory not found');
  }
};

export const doStreamOperations = async (operation, args, currentDir) => {
  switch (operation) {
    case 'cat':
      await showFile(args, currentDir);
      break;
    case 'cp':
      await copyFile(args, currentDir);
      break;
    case 'mv':
      await moveFile(args, currentDir);
      break;
    case 'hash':
      await calculateHash(args, currentDir);
      break;
    case 'compress':
      await compressFile(args, currentDir);
      break;
    case 'decompress':
      await decompressFile(args, currentDir);
      break;
    default:
      throw new InputError('Unknown stream operation');
  }
};

const showFile = async (args, currentDir) => {
  checkArgs(args, 1, 'cat');
  const filePath = resolve(currentDir, args[0]);

  try {
    await checkIsFile(filePath);

    const stream = createReadStream(filePath, 'utf8');
    stream.pipe(process.stdout);

    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  } catch {
    throw new OperationError('Cannot read file');
  }
};

const copyFile = async (args, currentDir) => {
  checkArgs(args, 2, 'cp');
  const from = resolve(currentDir, args[0]);
  const toDir = resolve(currentDir, args[1]);
  const fileName = basename(from);
  const toPath = resolve(toDir, fileName);

  try {
    await checkDirExists(toDir);
    await checkIsFile(from);

    const read = createReadStream(from);
    const write = createWriteStream(toPath);

    await pipeline(read, write);
  } catch {
    throw new OperationError('Cannot copy file');
  }
};

const moveFile = async (args, currentDir) => {
  checkArgs(args, 2, 'mv');
  const from = resolve(currentDir, args[0]);
  const toDir = resolve(currentDir, args[1]);
  const fileName = basename(from);
  const toPath = resolve(toDir, fileName);

  try {
    await checkDirExists(toDir);
    await checkIsFile(from);

    const read = createReadStream(from);
    const write = createWriteStream(toPath);
    await pipeline(read, write);

    await unlink(from);
  } catch {
    throw new OperationError('Cannot move file');
  }
};

const calculateHash = async (args, currentDir) => {
  checkArgs(args, 1, 'hash');
  const filePath = resolve(currentDir, args[0]);

  try {
    await checkIsFile(filePath);

    const hash = createHash('sha256');
    const stream = createReadStream(filePath);

    await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    console.log(hash.digest('hex'));
  } catch {
    throw new OperationError('Cannot calculate hash');
  }
};

const compressFile = async (args, currentDir) => {
  checkArgs(args, 2, 'compress');
  const from = resolve(currentDir, args[0]);
  const to = resolve(currentDir, args[1]);

  try {
    await checkIsFile(from);

    const read = createReadStream(from);
    const write = createWriteStream(to);
    const compress = createBrotliCompress();

    await pipeline(read, compress, write);
  } catch {
    throw new OperationError('Cannot compress file');
  }
};

const decompressFile = async (args, currentDir) => {
  checkArgs(args, 2, 'decompress');
  const from = resolve(currentDir, args[0]);
  const to = resolve(currentDir, args[1]);

  try {
    await checkIsFile(from);

    const read = createReadStream(from);
    const write = createWriteStream(to);
    const decompress = createBrotliDecompress();

    await pipeline(read, decompress, write);
  } catch {
    throw new OperationError('Cannot decompress file');
  }
};