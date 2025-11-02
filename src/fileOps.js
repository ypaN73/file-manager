import { writeFile, mkdir, rename, unlink, stat } from 'fs/promises';
import { resolve } from 'path';
import { InputError, OperationError } from './operations.js';

const checkArgs = (args, needed, cmd) => {
  if (args.length !== needed) {
    throw new InputError(`${cmd} needs ${needed} arguments`);
  }
};

export const doFileOperations = async (operation, args, currentDir) => {
  switch (operation) {
    case 'add':
      await createFile(args, currentDir);
      break;
    case 'mkdir':
      await createDir(args, currentDir);
      break;
    case 'rn':
      await renameItem(args, currentDir);
      break;
    case 'rm':
      await deleteFile(args, currentDir);
      break;
    default:
      throw new InputError('Unknown file operation');
  }
};

const createFile = async (args, currentDir) => {
  checkArgs(args, 1, 'add');
  const filePath = resolve(currentDir, args[0]);

  try {
    await writeFile(filePath, '');
  } catch {
    throw new OperationError('Cannot create file');
  }
};

const createDir = async (args, currentDir) => {
  checkArgs(args, 1, 'mkdir');
  const dirPath = resolve(currentDir, args[0]);

  try {
    await mkdir(dirPath);
  } catch {
    throw new OperationError('Cannot create directory');
  }
};

const renameItem = async (args, currentDir) => {
  checkArgs(args, 2, 'rn');
  const oldPath = resolve(currentDir, args[0]);
  const newPath = resolve(currentDir, args[1]);

  try {
    await rename(oldPath, newPath);
  } catch {
    throw new OperationError('Cannot rename');
  }
};

const deleteFile = async (args, currentDir) => {
  checkArgs(args, 1, 'rm');
  const filePath = resolve(currentDir, args[0]);

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      throw new OperationError('Not a file');
    }
    await unlink(filePath);
  } catch {
    throw new OperationError('Cannot delete file');
  }
};